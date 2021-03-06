<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [CallAPIOptions](./kibana-plugin-server.callapioptions.md)

## CallAPIOptions interface

The set of options that defines how API call should be made and result be processed.

<b>Signature:</b>

```typescript
export interface CallAPIOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [wrap401Errors](./kibana-plugin-server.callapioptions.wrap401errors.md) | <code>boolean</code> | Indicates whether <code>401 Unauthorized</code> errors returned from the Elasticsearch API should be wrapped into <code>Boom</code> error instances with properly set <code>WWW-Authenticate</code> header that could have been returned by the API itself. If API didn't specify that then <code>Basic realm=&quot;Authorization Required&quot;</code> is used as <code>WWW-Authenticate</code>. |

