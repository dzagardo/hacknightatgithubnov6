from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_text_and_create_documents(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    documents = text_splitter.create_documents([text])
    return documents
