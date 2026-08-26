#!/usr/bin/env python3
"""BreakGlass micro-server: serves this kit read-only on 127.0.0.1.

Usage: python3 serve.py [port]
Unlocks features that need real HTTP (emulator cores, ZIM streaming).
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT_DEFAULT = 8025

class KitHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".zim": "application/octet-stream",
        ".wasm": "application/wasm",
        ".data": "application/octet-stream",
        ".p8": "text/plain",
        ".js": "text/javascript",
        ".css": "text/css",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT_DEFAULT
    handler = partial(KitHandler, directory=".")
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    except OSError:
        print(f"Port {port} busy, trying {port + 1}…")
        server = ThreadingHTTPServer(("127.0.0.1", port + 1), handler)
    url = f"http://127.0.0.1:{server.server_port}/"
    print()
    print("  BreakGlass kit server")
    print(f"  Serving this folder read-only at: {url}")
    print("  Open that address in your browser. Press Ctrl+C to stop.")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
