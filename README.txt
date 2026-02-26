<<<<<<< HEAD
# Node Modules Error Fix (Vite - ERR_MODULE_NOT_FOUND)

Tanggalin yung `node_modules` sa `.gitignore` para maiwasan ang error tulad neto:

---

## If you encountered this error while trying to run:

node:internal/modules/esm/resolve:274
throw new ERR_MODULE_NOT_FOUND(
^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\User\Downloads\procurement-system\frontend\node_modules\vite\dist\node\cli.js' imported from C:\Users\User\Downloads\procurement-system\frontend\node_modules\vite\bin\vite.js'
at finalizeResolution (node:internal/modules/esm/resolve:274:11)
at moduleResolve (node:internal/modules/esm/resolve:864:10)
at defaultResolve (node:internal/modules/esm/resolve:990:11)
at #cachedDefaultResolve (node:internal/modules/esm/loader:735:20)
at ModuleLoader.resolve (node:internal/modules/esm/loader:712:38)
at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:310:38)
at onImport.tracePromise.proto (node:internal/modules/esm/loader:663:36)
at TracingChannel.tracePromise (node:diagnostics_channel:344:14)
at ModuleLoader.import (node:internal/modules/esm/loader:662:21)
at defaultImportModuleDynamicallyForModule (node:internal/modules/esm/utils:229:31) {
code: 'ERR_MODULE_NOT_FOUND',
url: 'file:///C:/Users/User/Downloads/procurement-system/frontend/node_modules/vite/dist/node/cli.js'
}
Node.js v24.6.0

---

## FIX: Run these following commands

### POWERSHELL

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm run dev

```cmd
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
npm run dev

---




=======
# Node Modules Error Fix (Vite - ERR_MODULE_NOT_FOUND)

Tanggalin yung `node_modules` sa `.gitignore` para maiwasan ang error tulad neto:

---

## If you encountered this error while trying to run:

node:internal/modules/esm/resolve:274
throw new ERR_MODULE_NOT_FOUND(
^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\User\Downloads\procurement-system\frontend\node_modules\vite\dist\node\cli.js' imported from C:\Users\User\Downloads\procurement-system\frontend\node_modules\vite\bin\vite.js'
at finalizeResolution (node:internal/modules/esm/resolve:274:11)
at moduleResolve (node:internal/modules/esm/resolve:864:10)
at defaultResolve (node:internal/modules/esm/resolve:990:11)
at #cachedDefaultResolve (node:internal/modules/esm/loader:735:20)
at ModuleLoader.resolve (node:internal/modules/esm/loader:712:38)
at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:310:38)
at onImport.tracePromise.proto (node:internal/modules/esm/loader:663:36)
at TracingChannel.tracePromise (node:diagnostics_channel:344:14)
at ModuleLoader.import (node:internal/modules/esm/loader:662:21)
at defaultImportModuleDynamicallyForModule (node:internal/modules/esm/utils:229:31) {
code: 'ERR_MODULE_NOT_FOUND',
url: 'file:///C:/Users/User/Downloads/procurement-system/frontend/node_modules/vite/dist/node/cli.js'
}
Node.js v24.6.0

---

## FIX: Run these following commands

### POWERSHELL

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm run dev

```cmd
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
npm run dev

---




>>>>>>> fe and be
