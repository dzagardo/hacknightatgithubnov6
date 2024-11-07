# Project Title

## Description

This project imports a Wikipedia article, splits it into chunks using LangChain's Recursive Character Text Splitter, and imports the chunks into a Weaviate cluster. It then applies Retrieval-Augmented Generation (RAG) using Weaviate's generative search capabilities.

## Setup

- Run `setup_project.sh` to set up the project.
- Fill in your API keys in the `.env` file.

## Usage

- Run `python src/main.py` to execute the pipeline.
