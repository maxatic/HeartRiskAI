"""
InstantDB client configuration for Django backend.
Uses HTTP requests to interact with InstantDB's API.
"""
import os
import json
import requests
from django.conf import settings
from typing import Optional, Dict, List

# InstantDB Configuration
INSTANTDB_APP_ID = os.environ.get('INSTANTDB_APP_ID', 'dedcbf6c-f946-489c-a174-853b24a9b397')
INSTANTDB_ADMIN_TOKEN = os.environ.get('INSTANTDB_ADMIN_TOKEN', '')
INSTANTDB_API_URL = os.environ.get('INSTANTDB_API_URL', 'https://api.instantdb.com')

# InstantDB client class
class InstantDBClient:
    """Client for interacting with InstantDB via HTTP API."""
    
    def __init__(self, app_id: str, admin_token: Optional[str] = None):
        self.app_id = app_id
        self.admin_token = admin_token
        self.base_url = INSTANTDB_API_URL
        self.headers = {
            'Content-Type': 'application/json',
            'X-App-ID': app_id,
        }
        if admin_token:
            self.headers['X-Admin-Token'] = admin_token
    
    def query(self, query: Dict) -> Dict:
        """
        Query data from InstantDB.
        
        Args:
            query: Query object following InstantDB query syntax
        
        Returns:
            Query results
        """
        try:
            response = requests.post(
                f'{self.base_url}/query',
                headers=self.headers,
                json={'query': query}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error querying InstantDB: {e}")
            return {}
    
    def mutate(self, mutation: Dict) -> Dict:
        """
        Mutate (insert/update) data in InstantDB.
        
        Args:
            mutation: Mutation object following InstantDB mutation syntax
        
        Returns:
            Mutation results
        """
        try:
            print(f"Attempting to mutate InstantDB at: {self.base_url}/mutate")
            print(f"Mutation data: {mutation}")
            response = requests.post(
                f'{self.base_url}/mutate',
                headers=self.headers,
                json={'mutation': mutation},
                timeout=10
            )
            print(f"Response status: {response.status_code}")
            print(f"Response text: {response.text[:200]}")
            response.raise_for_status()
            if response.text:
                return response.json()
            else:
                print("Warning: Empty response from InstantDB")
                return {}
        except requests.exceptions.RequestException as e:
            print(f"Request error mutating InstantDB: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text[:200]}")
            return {}
        except Exception as e:
            print(f"Error mutating InstantDB: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def transact(self, transaction: Dict) -> Dict:
        """
        Execute a transaction in InstantDB.
        
        Args:
            transaction: Transaction object
        
        Returns:
            Transaction results
        """
        try:
            response = requests.post(
                f'{self.base_url}/transact',
                headers=self.headers,
                json={'transaction': transaction}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error executing transaction in InstantDB: {e}")
            return {}

# Initialize InstantDB client
try:
    db = InstantDBClient(INSTANTDB_APP_ID, INSTANTDB_ADMIN_TOKEN)
except Exception as e:
    print(f"Warning: Failed to initialize InstantDB client: {e}")
    db = None

def get_instantdb_client():
    """Get the InstantDB client instance."""
    return db

def save_prediction(prediction_data):
    """
    Save a heart risk prediction to InstantDB.
    
    Args:
        prediction_data: Dictionary containing prediction results and input data
    
    Returns:
        Result of the mutation operation
    """
    if not db:
        print("InstantDB client not available")
        return None
    
    try:
        # Generate a unique ID for this prediction
        import uuid
        prediction_id = str(uuid.uuid4())
        
        # Structure the data for InstantDB mutation
        # InstantDB uses a transaction-based mutation system
        mutation = {
            'predictions': {
                prediction_id: {
                    'input_data': prediction_data.get('input_data', {}),
                    'risk_score': prediction_data.get('risk_score'),
                    'risk_level': prediction_data.get('risk_level'),
                    'risk_class': prediction_data.get('risk_class'),
                    'recommendation': prediction_data.get('recommendation'),
                    'factors': prediction_data.get('factors', []),
                    'timestamp': prediction_data.get('timestamp'),
                }
            }
        }
        
        result = db.mutate(mutation)
        return result
    except Exception as e:
        print(f"Error saving prediction to InstantDB: {e}")
        return None

def get_predictions(limit=10):
    """
    Retrieve recent predictions from InstantDB.
    
    Args:
        limit: Maximum number of predictions to retrieve
    
    Returns:
        List of predictions
    """
    if not db:
        print("InstantDB client not available")
        return []
    
    try:
        result = db.query({
            'predictions': {
                '$': {
                    'limit': limit,
                    'order': {'timestamp': 'desc'}
                }
            }
        })
        return result.get('predictions', [])
    except Exception as e:
        print(f"Error retrieving predictions from InstantDB: {e}")
        return []

