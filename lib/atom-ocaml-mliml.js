'use babel';

import { CompositeDisposable } from 'atom';

extMap = {
  'ml': 'mli',
  'mli': 'ml'
};

allowedExts = ['ml', 'mli'];

function fileParts(filepath) {
  match = filepath.match(/^(.+)\.(.+)$/);
  return match;
}

function filePath(file) {
  if (file.constructor.name == "RemoteFile") {
    return file._path;
  } else if (file.constructor.name == "File") {
    return file.path;
  } else {
    console.error("Unkown file type");
  }
}

function matchingFile() {
  editor = atom.workspace.getActiveTextEditor();
  file = editor && editor.buffer && editor.buffer.file;
  path = file && filePath(file);
  if (path) {
    parts = fileParts(path);
    extension = parts[2];
    matchingExtension = extMap[extension];
    if (matchingExtension) {
      return parts[1] && parts[1].concat(".").concat(matchingExtension);
    } else {
      console.info("Matching extension is not found");
    }
  } else {
    console.error("Current editor is not associated with a known file type");
  }
}

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-text-editor[data-grammar='source ocaml']", {
        'atom-ocaml-mliml:switch': () => this.switch()
      }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  switch() {
    targetFile = matchingFile();
    if (targetFile) {
      return (
        atom.workspace.open(targetFile)
      );
    }
  }
};
