import os
from weaviate_client_module import get_weaviate_client
from import_wikipedia import fetch_wikipedia_article
from text_splitter import split_text_and_create_documents

def main():
    # Fetch Wikipedia article
    article_name = "Albert_Einstein"
    article_text = fetch_wikipedia_article(article_name)

    # Split text into chunks
    documents = split_text_and_create_documents(article_text)

    # Get Weaviate client
    client = get_weaviate_client()

    # Delete existing schema (if needed)
    client.schema.delete_all()

    # Create schema (class)
    schema = {
        "class": "Chunk",
        "description": "A collection of text chunks from a Wikipedia article",
        "vectorizer": "text2vec-cohere",
        "properties": [
            {
                "name": "content",
                "dataType": ["text"]
            },
            {
                "name": "chunk_index",
                "dataType": ["int"]
            }
        ]
    }
    client.schema.create_class(schema)

    # Import documents into Weaviate
    with client.batch as batch:
        for i, doc in enumerate(documents):
            properties = {
                "content": doc.page_content,
                "chunk_index": i
            }
            batch.add_data_object(properties, class_name="Chunk")

    print("Chunks imported into Weaviate successfully.")

if __name__ == "__main__":
    main()
