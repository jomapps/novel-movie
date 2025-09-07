# Troubleshooting Project Creation Issues

## Problem: "The following field is invalid: Tone" Error

### Symptoms
- Error occurs when trying to create a new project
- Error message: `Error [ValidationError]: The following field is invalid: Tone`
- HTTP 500 status returned from `/v1/projects` endpoint

### Root Causes

1. **Database Not Seeded**: The `tone-options` collection is empty or missing
2. **Invalid Tone IDs**: The form is sending invalid or non-existent tone option IDs
3. **Empty Array Validation**: PayloadCMS is rejecting empty arrays for relationship fields
4. **Data Type Mismatch**: Tone field expects relationship IDs but receives other data types

### Diagnostic Steps

#### Step 1: Check Database Seeding
```bash
# Run the database seed check script
npm run db:seed-check

# If collections are missing, run the seed script
npm run db:seed
```

#### Step 2: Debug Tone Field Validation
```bash
# Run the tone validation debug script
npm run debug:tone
```

#### Step 3: Check Server Logs
Look for detailed error messages in your development server console when the project creation fails.

### Solutions

#### Solution 1: Ensure Database is Seeded
The most common cause is that the database hasn't been seeded with the required configuration data.

```bash
# Seed the database with all required collections
npm run db:seed
```

This will populate:
- Movie Formats
- Movie Styles  
- Genres
- Audience Demographics
- **Tone Options** ← Critical for this error
- Central Themes
- Mood Descriptors
- Cinematography Styles

#### Solution 2: Fixed Project Creation Route
The project creation route has been updated to handle relationship field validation better:

**File**: `src/app/v1/projects/route.ts`

Key improvements:
- Filters out empty strings and null values from relationship arrays
- Removes empty relationship arrays entirely (PayloadCMS prefers undefined over empty arrays)
- Provides more detailed error messages
- Handles tone field specifically

#### Solution 3: Verify Form Data
Check that the project creation form is sending valid data:

1. **Tone Field**: Should be an array of valid tone option IDs or undefined
2. **Empty Arrays**: Should be omitted entirely rather than sent as `[]`
3. **Required Fields**: name, movieFormat, movieStyle must be present

### Testing the Fix

#### Test 1: Create Project with No Optional Fields
Try creating a project with only the required fields:
- Project Name
- Movie Format  
- Movie Style
- Duration Unit

Leave all optional fields (including tone) empty.

#### Test 2: Create Project with Tone Selection
1. Select 1-2 tone options from the dropdown
2. Ensure the selected tones appear in the form
3. Submit the project

#### Test 3: Verify Database Content
```bash
# Check that tone options exist
curl http://localhost:3001/v1/config/tone-options

# Should return JSON with tone options like:
# {
#   "success": true,
#   "data": [
#     {"id": "...", "name": "Serious", "slug": "serious"},
#     {"id": "...", "name": "Comedic", "slug": "comedic"},
#     ...
#   ]
# }
```

### Prevention

1. **Always Seed Database**: Run `npm run db:seed` after setting up the project
2. **Check Required Collections**: Use the database seed check script regularly
3. **Validate Form Data**: Ensure forms send proper data types for relationship fields
4. **Monitor Server Logs**: Watch for validation errors during development

### Quick Fix Commands

```bash
# 1. Check if database is seeded
npm run db:seed-check

# 2. If not seeded, run seed script
npm run db:seed

# 3. Test tone field validation
npm run debug:tone

# 4. Restart development server
npm run dev
```

### Expected Behavior After Fix

1. **Empty Tone Field**: Project creation succeeds with no tone selected
2. **Valid Tone Selection**: Project creation succeeds with selected tones
3. **Invalid Tone ID**: Project creation fails with clear error message
4. **Better Error Messages**: More descriptive error information in server response

### Related Files

- `src/app/v1/projects/route.ts` - Project creation API route (updated)
- `src/collections/Projects.ts` - Project collection schema
- `src/collections/ToneOptions.ts` - Tone options collection schema
- `seed/tone-options-simple.json` - Tone options seed data
- `scripts/debug-tone-validation.js` - Diagnostic script
- `scripts/check-database-seed.js` - Database verification script

### Additional Notes

- The tone field is optional and can be left empty during project creation
- PayloadCMS relationship fields prefer `undefined` over empty arrays
- The project creation route now cleans up relationship field data automatically
- All relationship fields (primaryGenres, targetAudience, tone) are handled consistently
