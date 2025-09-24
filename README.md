# Inventory Dashboard (SAMPLE)

This is a sample dashboard design that can be used for other projects involving CRUD.

## Data format

Upload a JSON file matching this format:

```json
{
  "stats": {
    "totalUsers": 1245,
    "activeUsers": 984,
    "itemsInStock": 3457,
    "ordersToday": 142
  },
  "sales": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    "data": [1200, 1500, 1800, 2200, 2000, 2400, 2800]
  },
  "stock": {
    "labels": ["Electronics", "Apparel", "Groceries", "Books", "Furniture"],
    "data": [350, 420, 500, 260, 300]
  },
  "recent": [
    {
      "user": "John Doe",
      "action": "Added new inventory item",
      "date": "2025-08-10"
    }
  ]
}
```

A sample is provided: `sample-data.json`.

## How to use

- Click "Upload JSON" in the header and choose your data file.
- Toggle the theme with the moon/sun button. 
- Charts and UI should load automatically.
