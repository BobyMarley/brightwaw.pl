import { renderToStream, type RenderToStreamOptions } from "@builder.io/qwik/server";
import Root from "./root";
import { manifest } from "@qwik-client-manifest";

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
  });
}
