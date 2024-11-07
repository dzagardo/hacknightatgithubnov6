import requests
import os
from dotenv import load_dotenv

def get_wikimedia_access_token():
    load_dotenv()
    wikimedia_username = os.getenv("WIKIMEDIA_USERNAME")
    wikimedia_password = os.getenv("WIKIMEDIA_PASSWORD")

    auth_url = 'https://auth.enterprise.wikimedia.com/v1/login'
    headers = {'Content-Type': 'application/json'}
    data = {
        'username': wikimedia_username,
        'password': wikimedia_password
    }

    response = requests.post(auth_url, headers=headers, json=data)
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens['access_token']
        return access_token
    else:
        raise Exception(f"Failed to authenticate: {response.status_code} {response.text}")

def fetch_wikipedia_article(article_name):
    access_token = get_wikimedia_access_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    url = f"https://api.enterprise.wikimedia.com/v2/articles/{article_name}"

    data = {
        "filters": [
            {
                "field": "is_part_of.identifier",
                "value": "enwiki"  # Assuming we want English Wikipedia
            }
        ],
        "fields": ["article_body"],
        "limit": 1
    }

    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        data = response.json()
        if data:
            article_body = data[0]['article_body']['wikitext']
            return article_body
        else:
            raise Exception("Article not found.")
    else:
        raise Exception(f"Failed to fetch article: {response.status_code} {response.text}")

# For testing purposes
if __name__ == "__main__":
    article_name = "Albert_Einstein"  # Replace with the article you want to fetch
    article_text = fetch_wikipedia_article(article_name)
    print(article_text)
