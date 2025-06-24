"""Cache utilities"""


# pylint: disable=unused-argument
def shared_key_func(key: str, key_prefix: str, version: int = 1) -> str:
    """
    Compute key for shared cache. In order to be compatiable with other system,
    only the key is used.
    """
    return key
