'use babel';

import { CompositeDisposable } from 'atom';

const extMap = {
  'ml': 'mli',
  'mli': 'ml'
}

const allowedExts = ['ml', 'mli']

// arr: 0 = whole string, 1 = name, 2 = extension
function fileParts(filepath) {
  let match = filepath.match(/^(.+)\.(.+)$/)
  return match
}

// File like object (local or remote) -> string
function filePath(file) {
  if (file.constructor.name == "RemoteFile") {
    return file._path
  } else if (file.constructor.name == "File") {
    return file.path
  } else {
    console.error("Unkown file type")
  }
}

// Dir like object (local or remote) -> string
function directoryPath(dir) {
  let klass = dir.constructor.name
  if (klass == "RemoteDirectory") {
    return dir._uri
  } else if (klass == "Directory") {
    return dir.path
  } else {
    console.error("Unkown directory type")
  }
}

function currentFile() {
  let editor = atom.workspace.getActiveTextEditor()
  let file = editor && editor.buffer && editor.buffer.file
  let path = file && filePath(file)
  return path
}

function matchingFile(originalFile) {
  if (originalFile) {
    let parts = fileParts(originalFile)
    let name = parts[1]
    let extension = parts[2]
    let matchingExtension = extMap[extension]
    if (matchingExtension) {
      return name && name.concat(".").concat(matchingExtension)
    } else {
      console.info("Matching extension is not found")
    }
  } else {
    console.error("Current editor is not associated with a known file type")
  }
}

// Removes the dirPath prefix from filePath
function relativePath(dirPath, filePath) {
  return filePath.replace(dirPath, "")
}

// Awaitable<bool>
function checkExistence(path) {
  let rootDirs = atom.project.rootDirectories
  for (dir of rootDirs) {
    if (!dir.contains(path)) continue;
    let dirPath = directoryPath(dir)
    let relPath = relativePath(dirPath, path)
    return dir.getFile(relPath).exists()
  }

  return Promise.resolve(false)
}

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-text-editor[data-grammar='source ocaml']", {
        'atom-ocaml-mliml:switch': () => this.switch()
      }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  serialize() {
    return {
    }
  },

  switch() {
    let curF = currentFile()
    let matchingF = matchingFile(curF)
    if (matchingF) {
      checkExistence(matchingF).then(exists => {
        if (exists) {
          atom.workspace.open(matchingF)
        } else {
          console.log("Matching file does not exist")
        }
      })
      return
    }
  }
}
