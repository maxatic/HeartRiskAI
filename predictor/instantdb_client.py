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
INSTANTDB_ADMIN_TOKEN = os.environ.get('INSTANTDB_ADMIN_TOKEN', '0da616d9-0c10-4207-9614-cfcb129e636a')
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
        Mutate (insert/update) data in InstantDB using admin transact endpoint.
        
        Args:
            mutation: Mutation object following InstantDB mutation syntax
        
        Returns:
            Mutation results
        """
        try:
            # Convert mutation format to InstantDB transaction format
            # InstantDB expects: [["update", namespace, id, {attrs}], ...]
            steps = []
            for namespace, records in mutation.items():
                for record_id, attrs in records.items():
                    steps.append(["update", namespace, record_id, attrs])
            
            payload = {
                "app_id": self.app_id,
                "steps": steps
            }
            
            # Use admin transact endpoint
            url = f'{self.base_url}/admin/transact'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            print(f"Attempting to transact InstantDB at: {url}")
            print(f"Transaction steps: {steps}")
            
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=10
            )
            print(f"Response status: {response.status_code}")
            print(f"Response text: {response.text[:500] if response.text else 'empty'}")
            response.raise_for_status()
            if response.text:
                return response.json()
            else:
                print("Warning: Empty response from InstantDB")
                return {"status": "ok"}
        except requests.exceptions.RequestException as e:
            print(f"Request error mutating InstantDB: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text[:500] if e.response.text else 'empty'}")
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


# ============================================
# USER AUTHENTICATION FUNCTIONS
# ============================================

def save_user(user_data):
    """
    Save a user to InstantDB.
    
    Args:
        user_data: Dictionary containing user information
            - id: Django user ID
            - email: User's email
            - full_name: User's full name
            - role: 'patient' or 'doctor'
            - created_at: Timestamp
    
    Returns:
        Result of the mutation operation
    """
    if not db:
        print("InstantDB client not available")
        return None
    
    try:
        import uuid
        user_id = user_data.get('id') or str(uuid.uuid4())
        
        mutation = {
            'users': {
                str(user_id): {
                    'django_id': user_data.get('id'),
                    'email': user_data.get('email'),
                    'full_name': user_data.get('full_name'),
                    'role': user_data.get('role'),
                    'created_at': user_data.get('created_at'),
                }
            }
        }
        
        result = db.mutate(mutation)
        print(f"User saved to InstantDB: {user_data.get('email')}")
        return result
    except Exception as e:
        print(f"Error saving user to InstantDB: {e}")
        return None


def save_doctor_profile(profile_data):
    """
    Save a doctor profile to InstantDB.
    
    Args:
        profile_data: Dictionary containing doctor profile information
    
    Returns:
        Result of the mutation operation
    """
    if not db:
        print("InstantDB client not available")
        return None
    
    try:
        import uuid
        profile_id = profile_data.get('id') or str(uuid.uuid4())
        
        mutation = {
            'doctor_profiles': {
                str(profile_id): {
                    'user_id': profile_data.get('user_id'),
                    'license_number': profile_data.get('license_number', ''),
                    'specialization': profile_data.get('specialization', 'Cardiology'),
                    'created_at': profile_data.get('created_at'),
                }
            }
        }
        
        result = db.mutate(mutation)
        print(f"Doctor profile saved to InstantDB")
        return result
    except Exception as e:
        print(f"Error saving doctor profile to InstantDB: {e}")
        return None


def save_patient_profile(profile_data):
    """
    Save a patient profile to InstantDB.
    
    Args:
        profile_data: Dictionary containing patient profile information
    
    Returns:
        Result of the mutation operation
    """
    if not db:
        print("InstantDB client not available")
        return None
    
    try:
        import uuid
        profile_id = profile_data.get('id') or str(uuid.uuid4())
        
        mutation = {
            'patient_profiles': {
                str(profile_id): {
                    'user_id': profile_data.get('user_id'),
                    'doctor_id_code': profile_data.get('doctor_id_code', ''),
                    'assigned_doctor_id': profile_data.get('assigned_doctor_id'),
                    'created_at': profile_data.get('created_at'),
                }
            }
        }
        
        result = db.mutate(mutation)
        print(f"Patient profile saved to InstantDB")
        return result
    except Exception as e:
        print(f"Error saving patient profile to InstantDB: {e}")
        return None


def get_user_by_email(email):
    """
    Retrieve a user from InstantDB by email.
    
    Args:
        email: User's email address
    
    Returns:
        User data or None if not found
    """
    if not db:
        print("InstantDB client not available")
        return None
    
    try:
        result = db.query({
            'users': {
                '$': {
                    'where': {'email': email}
                }
            }
        })
        users = result.get('users', [])
        return users[0] if users else None
    except Exception as e:
        print(f"Error retrieving user from InstantDB: {e}")
        return None


def get_all_users(role=None, limit=50):
    """
    Retrieve all users from InstantDB.
    
    Args:
        role: Optional filter by role ('patient' or 'doctor')
        limit: Maximum number of users to retrieve
    
    Returns:
        List of users
    """
    if not db:
        print("InstantDB client not available")
        return []
    
    try:
        query = {
            'users': {
                '$': {
                    'limit': limit
                }
            }
        }
        
        if role:
            query['users']['$']['where'] = {'role': role}
        
        result = db.query(query)
        return result.get('users', [])
    except Exception as e:
        print(f"Error retrieving users from InstantDB: {e}")
        return []

