export type GlitchFrame = readonly string[];

type GlitchFramesOptions = {
  frameCount: number;
  glyphs: string;
  lines: readonly string[];
};

export function createGlitchFrames({
  frameCount,
  glyphs,
  lines,
}: GlitchFramesOptions): GlitchFrame[] {
  const safeFrameCount = Math.max(2, frameCount);
  const safeGlyphs = glyphs.length > 0 ? glyphs : "#";

  return Array.from({ length: safeFrameCount }, (_, frameIndex) =>
    lines.map((line) =>
      Array.from(line)
        .map((character, characterIndex) =>
          getFrameCharacter({
            character,
            characterIndex,
            frameIndex,
            frameCount: safeFrameCount,
            glyphs: safeGlyphs,
            line,
          }),
        )
        .join(""),
    ),
  );
}

export function createScrambleFrames({
  frameCount,
  glyphs,
  lines,
}: GlitchFramesOptions): GlitchFrame[] {
  const safeFrameCount = Math.max(2, frameCount);
  const safeGlyphs = glyphs.length > 0 ? glyphs : "#";

  return Array.from({ length: safeFrameCount }, (_, frameIndex) =>
    lines.map((line) =>
      Array.from(line)
        .map((character, characterIndex) =>
          character.trim() === ""
            ? character
            : getGlitchGlyph({
                character,
                characterIndex,
                frameIndex,
                glyphs: safeGlyphs,
              }),
        )
        .join(""),
    ),
  );
}

function getFrameCharacter({
  character,
  characterIndex,
  frameIndex,
  frameCount,
  glyphs,
  line,
}: {
  character: string;
  characterIndex: number;
  frameIndex: number;
  frameCount: number;
  glyphs: string;
  line: string;
}) {
  if (frameIndex === frameCount - 1 || character.trim() === "") {
    return character;
  }

  const revealAt = Math.floor(
    ((characterIndex + 1) / Math.max(1, line.length)) * (frameCount - 1),
  );

  if (frameIndex >= revealAt) {
    return character;
  }

  return getGlitchGlyph({
    character,
    characterIndex,
    frameIndex,
    glyphs,
  });
}

function getGlitchGlyph({
  character,
  characterIndex,
  frameIndex,
  glyphs,
}: {
  character: string;
  characterIndex: number;
  frameIndex: number;
  glyphs: string;
}) {
  const glyphIndex =
    (character.charCodeAt(0) + characterIndex * 17 + frameIndex * 31) %
    glyphs.length;

  return glyphs[glyphIndex];
}
