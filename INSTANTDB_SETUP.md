# InstantDB Integration Setup

This Django project is integrated with InstantDB for real-time data storage.

## Configuration

Your InstantDB App ID is configured in `heart_risk_project/settings.py`:
- **App ID**: `dedcbf6c-f946-489c-a174-853b24a9b397`

## Environment Variables (Optional)

You can override the App ID or set an Admin Token using environment variables:

```bash
export INSTANTDB_APP_ID='dedcbf6c-f946-489c-a174-853b24a9b397'
export INSTANTDB_ADMIN_TOKEN='your_admin_token_here'
```

## How It Works

1. **Client Setup**: The InstantDB client is initialized in `predictor/instantdb_client.py`
2. **Saving Predictions**: When a user completes a heart risk assessment, the prediction data is automatically saved to InstantDB
3. **Data Structure**: Predictions are stored with the following structure:
   - Input data (age, blood pressure, etc.)
   - Risk score and level
   - Recommendations
   - Risk factors analysis
   - Timestamp

## API Endpoint

The current implementation uses HTTP requests to interact with InstantDB. If InstantDB provides a different API endpoint, update `INSTANTDB_API_URL` in `instantdb_client.py`.

## Admin Token

For admin operations (like querying all predictions), you'll need to set the `INSTANTDB_ADMIN_TOKEN` environment variable. Get this token from your InstantDB dashboard.

## Testing

To test the integration:
1. Run your Django server: `python manage.py runserver`
2. Complete a heart risk assessment
3. Check your InstantDB dashboard to see the stored prediction

## Notes

- InstantDB is primarily a JavaScript/TypeScript library, so this integration uses HTTP requests
- If InstantDB releases an official Python SDK, we can update the implementation
- The current setup stores predictions in a `predictions` collection in InstantDB

