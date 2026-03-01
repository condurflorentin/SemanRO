"""
Rate Limiting Middleware
────────────────────────
Previne atacurile Brute Force asupra endpoint-urilor de autentificare.
Folosește SlowAPI (bazat pe limits) cu stocare in-memory.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Limiter global — key_func extrage IP-ul clientului
limiter = Limiter(key_func=get_remote_address)
