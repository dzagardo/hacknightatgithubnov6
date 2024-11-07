import os
import weaviate
from weaviate.auth import AuthApiKey
from dotenv import load_dotenv
from pathlib import Path

def get_weaviate_client():
    # Determine the path to the .env file relative to this script
    base_dir = Path(__file__).resolve().parent.parent  # Points to 'project' directory
    env_path = base_dir / '.env'

    # Load the .env file
    load_dotenv(dotenv_path=env_path)

    weaviate_url = os.getenv("WEAVIATE_URL")
    weaviate_api_key = os.getenv("WEAVIATE_API_KEY")
    cohere_api_key = os.getenv("COHERE_API_KEY")

    # Verify that the environment variables are loaded
    if not weaviate_url:
        raise ValueError("WEAVIATE_URL is not set.")
    if not weaviate_api_key:
        raise ValueError("WEAVIATE_API_KEY is not set.")
    if not cohere_api_key:
        raise ValueError("COHERE_API_KEY is not set.")

    # Use AuthApiKey for authentication
    auth_config = AuthApiKey(api_key=weaviate_api_key)

    # Connect to Weaviate Cloud using weaviate.Client
    client = weaviate.Client(
        url=weaviate_url,
        auth_client_secret=auth_config,
        additional_headers={
            "X-Cohere-Api-Key": cohere_api_key
        }
    )
    return client
