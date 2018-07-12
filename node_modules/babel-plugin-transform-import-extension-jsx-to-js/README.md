# babel-plugin-transform-import-extension-jsx-to-js

This Babel 6 plugin transforms the extension of imported files from .jsx to .js.

For example:

```
import { foo } from 'foo.jsx';

```

Becomes:

```
import { foo } from 'foo.js';
```


All this does is use `resolveModuleSource`: 

```
babel.transform('code', {
  resolveModuleSource: function (source) {
    return source.replace('.jsx', '.js');
  }
})
```
