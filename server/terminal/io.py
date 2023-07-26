from types import TracebackType
from typing import AnyStr, Iterable, Iterator, Optional, TextIO, Type

from simple_websocket import Server

class WebSocketIOV2(TextIO):
    socket = None

    def __init__(self, socket: Server):
        self.socket = socket
    
    def __enter__(self) -> TextIO:
        pass

    def close(self) -> None:
        self.socket.close()

    def fileno(self) -> int:
        return 0

    def flush(self) -> None:
        pass

    def isatty(self) -> bool:
        return False

    def read(self, n: int = ...) -> AnyStr:
        data = self.socket.receive()
        return data

    def readable(self) -> bool:
        return True

    def readline(self, limit: int = ...) -> AnyStr:
        data = self.socket.receive()
        return data

    def readlines(self, hint: int = ...):
        pass

    def seek(self, offset: int, whence: int = ...) -> int:
        pass

    def seekable(self) -> bool:
        pass

    def tell(self) -> int:
        pass

    def truncate(self, size: Optional[int] = ...) -> int:
        pass

    def writable(self) -> bool:
        pass

    def writelines(self, lines: Iterable[AnyStr]) -> None:
        pass

    def __next__(self) -> AnyStr:
        pass

    def __iter__(self) -> Iterator[AnyStr]:
        pass

    def __exit__(self, t: Optional[Type[BaseException]], value: Optional[BaseException],
                 traceback: Optional[TracebackType]) -> Optional[bool]:
        pass

    def write(self, text: str):
        self.socket.send(text)
    
    def write(self, *params):
        items = []
        for param in params:
            items.append(str(param))
        self.socket.send("".join(items))
