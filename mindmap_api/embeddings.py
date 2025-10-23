"""Utility helpers for generating placeholder embeddings."""
from __future__ import annotations

import hashlib
from typing import Iterable, List

from mindmap_api.models import VECTOR_DIMENSION


def deterministic_embedding(*parts: Iterable[str | None] | str | None) -> List[float]:
    """Create a deterministic embedding from text parts.

    The function is intentionally simple: it hashes the concatenation of provided
    strings and maps the hash to a fixed-size vector in the range [-1, 1].
    This keeps the project self-contained while still leveraging the pgvector
    column for similarity-friendly storage.
    """

    flat_parts: list[str] = []
    for value in parts:
        if value is None:
            continue
        if isinstance(value, str):
            flat_parts.append(value)
        else:
            flat_parts.extend([segment for segment in value if segment is not None])
    base = "||".join(flat_parts).encode("utf-8")
    digest = hashlib.sha256(base).digest()
    # Use the digest to fill the vector
    vector = []
    for index in range(VECTOR_DIMENSION):
        byte = digest[index % len(digest)]
        normalized = (byte / 255.0) * 2 - 1
        vector.append(round(normalized, 6))
    return vector
