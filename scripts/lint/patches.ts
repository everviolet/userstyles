import * as color from "@std/fmt/colors";

// args: groups..., offset, string, groups
type PatchReplacer = (substring: string, ...args: any[]) => string;
type Patch = [RegExp, string | PatchReplacer];

interface PatchProps {
  patches: Patch[];
  file?: string; // automatically write to file, depends on `props.write`
  write?: boolean; // defaults to true
}

function logPatch(repl: string | PatchReplacer) {
  return (substring: string, ...args: any[]) => {
    console.log(`/${color.cyan(substring)}/`);

    if (typeof repl == "function") {
      repl = repl(substring, ...args);
    }
    return repl;
  };
}

export function applyPatches(
  content: string,
  props: PatchProps,
): { patched: string } {
  let current = content;

  props.patches.forEach((patch) => {
    try {
      const next = current.replaceAll(patch[0], logPatch(patch[1]));
      if (next) {
        current = next;
      }
    } catch (e) {
      console.error(e);
    }
  });

  if (current == content) {
    console.log("No changes from patches");
    return { patched: content };
  }

  if (props.file && props.write != false) {
    console.log(
      `Writing patches to ${props.file}`,
    );
    Deno.writeTextFileSync(props.file, current);
  }

  return { patched: current };
}

function makeVarPatch(from: string, to: string): Patch {
  return [
    new RegExp(`@(?<brl>{?)(?<color>${from})\\b(?<brr>}?)`, "g"),
    (
      _sub: string,
      _brl: string,
      _color: string,
      _brr: string,
      _offset: number,
      _str: string,
      groups: { brl?: string; color: string; brr?: string },
    ) => {
      const { brl, brr } = groups;
      return `@${brl}${to}${brr}`;
    },
  ];
}

export const patches: Patch[] = [
  // == keywords ==
  [/lightFlavor/g, "lightVariant"],
  [/darkFlavor/g, "darkVariant"],

  [/#catppuccin/g, "#evergarden"],

  // == variants ==
  [/latte/g, "summer"],
  [/Latte/g, "Summer"],
  [/frappe/g, "spring"],
  [/Frappé/g, "Spring"],
  [/macchiato/g, "fall"],
  [/Macchiato/g, "Fall"],
  [/mocha/g, "winter"],
  [/Mocha/g, "Winter"],

  makeVarPatch("flavor", "variant"),

  // == colors ==
  makeVarPatch("rosewater", "cherry"),
  makeVarPatch("flamingo", "cherry"),
  // pink
  makeVarPatch("mauve", "skye"),
  // red
  makeVarPatch("maroon", "red"),
  makeVarPatch("peach", "orange"),
  // yellow
  // green
  makeVarPatch("teal", "aqua"),
  makeVarPatch("sky", "skye"),
  makeVarPatch("sapphire", "snow"),
  // blue
  makeVarPatch("lavender", "skye"),

  // == lib ==
  [
    /https:\/\/userstyles\.catppuccin\.com\/lib\/lib\.less/g,
    "https://evergarden.moe/userstyles/lib/lib.less",
  ],
];
