module.exports = {
  roots: ["<rootDir>/__tests__"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupEnzyme.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
