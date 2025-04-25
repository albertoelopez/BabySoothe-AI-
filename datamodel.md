Okay, let's design a data model for the BabySoothe AI application using Supabase (which uses PostgreSQL). This model leverages Supabase Auth for user management and Supabase Storage for audio files.

We'll define the necessary tables, columns, relationships, and Row Level Security (RLS) considerations.

**Core Supabase Services Used:**

1.  **Supabase Auth:** Manages user sign-up, login, and provides unique user IDs (`auth.users` table).
2.  **Supabase Database (PostgreSQL):** Hosts our custom tables.
3.  **Supabase Storage:** Stores audio files (built-in sounds and user recordings).

**Database Tables:**

**1. `user_settings`**
   *   Stores individual user preferences and configuration for the app.
   *   **RLS:** Enable RLS. Users can only SELECT, INSERT, UPDATE their own settings row.

   | Column Name                     | Data Type         | Constraints/Notes                                                      |
   | :------------------------------ | :---------------- | :--------------------------------------------------------------------- |
   | `id`                            | `uuid`            | Primary Key, Default: `gen_random_uuid()`                              |
   | `user_id`                       | `uuid`            | Foreign Key -> `auth.users.id`, **Unique**, Not Null                     |
   | `created_at`                    | `timestamp with time zone` | Default: `now()`                                                   |
   | `updated_at`                    | `timestamp with time zone` | Default: `now()`, Use trigger to auto-update on modification         |
   | `selected_microphone_id`        | `text`            | Nullable. Stores OS-specific identifier for the selected microphone. |
   | `application_volume`            | `real`            | Default: `0.75`. Range 0.0 to 1.0.                                     |
   | `default_timer_duration_seconds` | `integer`         | Default: `1800` (30 min). `0` or `null` could mean continuous.         |
   | `start_minimized`               | `boolean`         | Default: `false`                                                       |
   | `start_listening_on_launch`     | `boolean`         | Default: `false`                                                       |
   | `onboarding_complete`           | `boolean`         | Default: `false`                                                       |
   | `max_volume_warning_shown`      | `boolean`         | Default: `false`                                                       |

**2. `sounds`**
   *   Stores metadata about available soothing sounds (both built-in and user-uploaded).
   *   **RLS:** Enable RLS.
     *   Users can SELECT all `BUILTIN` sounds (`user_id IS NULL`).
     *   Users can SELECT, INSERT, UPDATE, DELETE their own `USER_RECORDED` sounds (`user_id` matches `auth.uid()`).

   | Column Name      | Data Type                  | Constraints/Notes                                                                                                |
   | :--------------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------- |
   | `id`             | `uuid`                     | Primary Key, Default: `gen_random_uuid()`                                                                        |
   | `user_id`        | `uuid`                     | Foreign Key -> `auth.users.id`, **Nullable**. `NULL` indicates a built-in sound, otherwise it's user-uploaded. |
   | `created_at`     | `timestamp with time zone` | Default: `now()`                                                                                                   |
   | `name`           | `text`                     | Not Null. User-facing display name (e.g., "White Noise - Fan", "Mom's Shushing").                             |
   | `storage_path`   | `text`                     | Not Null. Path to the audio file in Supabase Storage (e.g., `builtin/whitenoise.wav`, `user/{user_id}/shush.mp3`). |
   | `type`           | `text`                     | Not Null. Check constraint: `type IN ('BUILTIN', 'USER_RECORDED')`                                              |
   | `tags`           | `text[]`                   | Nullable. Array of tags for filtering/organization (e.g., `{'white_noise', 'continuous'}`).                  |
   | `duration_seconds`| `integer`                  | Nullable. Duration of the sound. `NULL` might imply looping or very long duration.                           |

**3. `mood_sound_mappings`**
   *   Stores the user's preferred sound to play for each detected mood category.
   *   **RLS:** Enable RLS. Users can only SELECT, INSERT, UPDATE, DELETE their own mappings.

   | Column Name     | Data Type                  | Constraints/Notes                                                                                              |
   | :-------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------- |
   | `id`            | `uuid`                     | Primary Key, Default: `gen_random_uuid()`                                                                      |
   | `user_id`       | `uuid`                     | Foreign Key -> `auth.users.id`, Not Null                                                                       |
   | `created_at`    | `timestamp with time zone` | Default: `now()`                                                                                               |
   | `updated_at`    | `timestamp with time zone` | Default: `now()`, Use trigger to auto-update on modification                                                  |
   | `mood_category` | `text`                     | Not Null. Identifier for the mood (e.g., `'DISTRESSED_CRYING'`, `'FUSSY_WHIMPERING'`, `'CALM_NEUTRAL'`).       |
   | `sound_id`      | `uuid`                     | Foreign Key -> `sounds.id`, **Nullable**. `NULL` means no sound should be played for this mood.                |
   |                 |                            | **Unique Constraint:** `(user_id, mood_category)` ensures only one mapping per mood per user.                  |

**(Future Extension Table)**

**4. `feedback_log` (Optional - for future learning features)**
    *   Logs user feedback on the effectiveness of sounds.
    *   **RLS:** Enable RLS. Users can INSERT their own feedback. SELECT/DELETE might be restricted or allowed based on use case. Admin/analysis roles might need broader SELECT access.

    | Column Name       | Data Type                  | Constraints/Notes                                                       |
    | :---------------- | :------------------------- | :---------------------------------------------------------------------- |
    | `id`              | `uuid`                     | Primary Key, Default: `gen_random_uuid()`                               |
    | `user_id`         | `uuid`                     | Foreign Key -> `auth.users.id`, Not Null                                |
    | `created_at`      | `timestamp with time zone` | Default: `now()`                                                        |
    | `detected_mood`   | `text`                     | Not Null. The mood detected when feedback was given.                    |
    | `played_sound_id` | `uuid`                     | Foreign Key -> `sounds.id`, Not Null. The sound playing during feedback. |
    | `feedback_value`  | `text`                     | Not Null. Check constraint: `feedback_value IN ('WORKED', 'DID_NOT_WORK')` |

**Supabase Storage Setup:**

1.  **Create Buckets:**
    *   `builtin-sounds`: (Optional: Could be public if non-sensitive) Stores the default sounds shipped with the app. Populate this bucket manually or via a seeding script. Set appropriate file access policies (e.g., public read or authenticated read).
    *   `user-sounds`: Stores sounds uploaded/recorded by users. **Crucially, set this bucket to be private.** Access control will be managed via Storage RLS policies tied to the `sounds` table `user_id` column.

2.  **Storage RLS Policies (Example for `user-sounds`):**
    *   Allow logged-in users to `select` files if they own the corresponding record in the `sounds` table (`sounds.user_id` matches `auth.uid()` and `sounds.storage_path` matches the requested file path).
    *   Allow logged-in users to `insert` files into their designated path (`user/{user_id}/...`).
    *   Allow logged-in users to `delete` files if they own the corresponding `sounds` record.

**Initial Data (Seeding):**

*   You will need to populate the `sounds` table with entries for all the built-in sounds (`user_id = NULL`, `type = 'BUILTIN'`) and upload the corresponding audio files to the `builtin-sounds` bucket, ensuring the `storage_path` column matches the file location.
*   Consider creating default entries in `mood_sound_mappings` for new users, possibly using a trigger or function upon user creation or first login, linking moods to default `BUILTIN` sounds.

This Supabase model provides a robust, scalable, and secure foundation for your BabySoothe AI application, handling user data, preferences, and audio files effectively. Remember to implement the RLS policies carefully to ensure data privacy and security.
