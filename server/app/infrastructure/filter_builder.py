from app.domain.exceptions import InvalidFilterError


class FilterConditionsBuilder:
    _SUPPORTED_OPS = {"eq", "neq", "gt", "gte", "lt", "lte", "in", "like"}

    @staticmethod
    def apply(df, filter_conditions: dict | None):
        """Apply filter_conditions dict to a pandas DataFrame and return filtered df."""
        if not filter_conditions:
            return df

        import pandas as pd

        result = df.copy()

        for flt in filter_conditions.get("filters", []):
            field = flt.get("field")
            op = flt.get("operator")
            value = flt.get("value")

            if op not in FilterConditionsBuilder._SUPPORTED_OPS:
                raise InvalidFilterError(f"Unsupported operator: {op}")

            if field not in result.columns:
                continue

            col = result[field]
            if op == "eq":
                result = result[col == value]
            elif op == "neq":
                result = result[col != value]
            elif op == "gt":
                result = result[col > value]
            elif op == "gte":
                result = result[col >= value]
            elif op == "lt":
                result = result[col < value]
            elif op == "lte":
                result = result[col <= value]
            elif op == "in":
                result = result[col.isin(value)]
            elif op == "like":
                result = result[col.astype(str).str.contains(str(value), na=False)]

        # Sort
        sort_fields = filter_conditions.get("sort", [])
        if sort_fields:
            by = [s["field"] for s in sort_fields if s["field"] in result.columns]
            ascending = [s.get("direction", "asc") == "asc" for s in sort_fields if s["field"] in result.columns]
            if by:
                result = result.sort_values(by=by, ascending=ascending)

        return result
