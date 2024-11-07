import weaviate
from weaviate.auth import AuthApiKey  # Correct import for AuthApiKey
import os
from dotenv import load_dotenv  # Import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Best practice: store your credentials in environment variables
wcd_url = os.getenv("WEAVIATE_URL")
wcd_api_key = os.getenv("WEAVIATE_API_KEY")

# Check if the environment variables are loaded
if not wcd_url:
    raise ValueError("WEAVIATE_URL environment variable not set.")
if not wcd_api_key:
    raise ValueError("WEAVIATE_API_KEY environment variable not set.")

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=wcd_url,
    auth_credentials=AuthApiKey(wcd_api_key),
)

print(client.is_ready())  # Should print: `True`

client.close()  # Free up resources
