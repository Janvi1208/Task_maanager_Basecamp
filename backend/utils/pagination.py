import math
from dataclasses import dataclass


@dataclass
class PageParams:
    page: int = 1
    limit: int = 20

    def __post_init__(self):
        if self.page < 1:
            self.page = 1
        if self.limit < 1:
            self.limit = 1
        if self.limit > 100:
            self.limit = 100

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def total_pages(total: int, limit: int) -> int:
    return max(1, math.ceil(total / limit)) if limit else 1
