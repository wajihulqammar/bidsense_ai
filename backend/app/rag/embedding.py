"""
app/rag/embedding.py
Embedding utilities.

ChromaDB's default embedding function (all-MiniLM-L6-v2 via sentence-transformers)
is used unless overridden here. This module provides extension points for swapping
to OpenAI embeddings or a custom model in future.
"""

# ChromaDB uses its built-in embedding function by default when no embedding_function
# is passed to get_or_create_collection(). No action required for the default pipeline.
#
# To switch to OpenAI embeddings, uncomment the following and pass
# embedding_function=get_openai_embedding_function() to get_or_create_collection().
#
# from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
# from app.utils.config import settings
#
# def get_openai_embedding_function():
#     return OpenAIEmbeddingFunction(
#         api_key=settings.OPENAI_API_KEY,
#         model_name="text-embedding-3-small",
#     )
