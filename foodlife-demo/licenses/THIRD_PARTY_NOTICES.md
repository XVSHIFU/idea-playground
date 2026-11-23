# Third-party notices

The offline demo bundles React 16.0.0 and ReactDOM 16.0.0 UMD files sourced from the local notebook runtime distribution. React is licensed under MIT by Meta Platforms, Inc. and affiliates (formerly Facebook, Inc.).

The source project uses a small React.Fragment compatibility shim because this offline UMD version predates the native React.Fragment API. This is a **demo-only compatibility decision**, not a recommended production dependency choice. Upgrade React to the current stable version and replace the shim when integrating into the full application.

The original food SVG illustrations and product UI are generated in this demo project. No images are loaded from third-party sites.
