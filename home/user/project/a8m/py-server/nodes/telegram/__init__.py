"""Telegram node package.

This module is intentionally lightweight and serves only to expose the
public API of the :mod:`telegram` node implementation.  Importing this
package will automatically expose the primary node class and any other
public objects defined in submodules.

The module is deliberately minimal to keep import time low and avoid
unnecessary dependencies until the node is actually used.
"""

# Public interface
__all__ = []

# Import the primary node class lazily to keep the package import fast.
# If the implementation changes, update this import accordingly.
try:
    from .node import TelegramNode  # noqa: F401
    __all__.append("TelegramNode")
except Exception:  # pragma: no cover
    # The node implementation may not be present yet; this allows the package
    # to be imported without raising errors during development or in
    # environments where the telegram node is optional.
    pass

# End of file