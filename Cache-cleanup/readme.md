# Step-by-step
To fully clear the cache in SAP ECC Fiori—especially after deleting an entity that still appears in /IWFND/GW_CLIENT—you need to perform cache cleanup across multiple layers: Gateway, Backend, Frontend, and Client (browser). Here's a step-by-step guide:

🔧 1. Clear Gateway Metadata Cache

Transaction: /IWFND/CACHE_CLEANUP
This clears the metadata cache for OData services on the Gateway system.


🔧 2. Clear Backend Metadata Cache

Transaction: /IWBEP/CACHE_CLEANUP
Run this on both the Backend and Gateway systems to ensure full cleanup of OData metadata.


🔧 3. Invalidate HTTP Server Cache

Transaction: SMICM
Navigate to:
Goto → HTTP Plugin → Server Cache → Invalidate Locally
Goto → HTTP Plugin → Server Cache → Invalidate Globally


🔧 4. Clear UI2 and SAPUI5 Caches
Use transaction SE38 to run the following reports:

/UI2/INVALIDATE_GLOBAL_CACHES – Clears global UI2 caches.
/UI2/INVALIDATE_CLIENT_CACHES – Clears client-side UI2 caches.
/UI2/CHIP_SYNCHRONIZE_CACHE – Synchronizes CHIP cache.
/UI2/DELETE_CACHE_AFTER_IMP – Deletes cache after import.
/UI2/DELETE_CACHE – Deletes general UI2 cache.
/UI5/APP_INDEX_CALCULATE – Recalculates SAPUI5 application index (can be full or delta).


🔧 5. Clear Browser Cache

Manually clear your browser cache or use Incognito Mode to bypass cached resources.
In Chrome: Ctrl + Shift + R for hard reload.


✅ Optional: Use Cache Buster

Ensure the cache buster is active via SICF service /sap/bc/ui2/flp.
You can also run /UI5/UPDATE_CACHEBUSTER via SE38 to manually trigger it.


🧪 Test Again in /IWFND/GW_CLIENT
After completing all the above steps, test your service again in /IWFND/GW_CLIENT. The deleted entity should no longer appear.
