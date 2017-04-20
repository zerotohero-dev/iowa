/*   __      ______    __   __  ___       __
 *  |" \    /    " \  |"  |/  \|  "|     /""\
 *  ||  |  // ____  \ |'  /    \:  |    /    \
 *  |:  | /  /    ) :)|: /'        |   /' /\  \
 *  |.  |(: (____/ //  \//  /\'    |  //  __'  \
 *  /\  |\\        /   /   /  \\   | /   /  \\  \
 * (__\_|_)\"_____/   |___/    \___|(___/    \___)
 *
 * This project is a part of the “Byte-Sized JavaScript” videocast.
 *
 * You can watch “Byte-Sized JavaScript” at: https://bytesized.tv/
 *
 * MIT Licensed — See LICENSE.md
 *
 * Send your comments, suggestions, and feedback to me@volkan.io
 */

/**
 * @module iowa
 */

const {
    readFile: readFileFs,
    writeFile: writeFileFs,
    stat: statFs,
    access, readdir,
    constants: { F_OK }
} = require( 'fs' );

const { dirname, join } = require( 'path' );

const mkdirp = require( 'mkdirp' );

const { invert } = require( 'delgado' );

const parse = ( response, json = true ) =>
    ( json && typeof response === 'string' ) ?
        JSON.parse( response ) :
        ( typeof response === 'string' ? response.trim() : response );

const stringify = ( data, json = true ) => (
    ( json && typeof data === 'object' ) ? JSON.stringify( data ) : `${data}`
).trim();

const defaultOptions = { json: true, createIfNotExists: true, encoding: 'utf8', seed: '' };
const defaultTextFileOptions = { json: false, createIfNotExists: true, encoding: 'utf8', seed: '' };

const NO_ENTRY = 'ENOENT';

/**
 * @private
 *
 * This method is private. It is <strong>not</strong> exported, and it is <strong>not</strong>
 * meant for public use.
 *
 * Write to the file at <code>path</code>, while recursively creating the directory structure if
 * path to the file does not exist.
 *
 * @param {string} path The path to the file.
 * @param {object} data What to write
 * @param {object} options Configuration options,
 *      An example is <code>{ json: true, encoding: 'utf8' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a `boolean` flag that indicates whether the data is written as
 *          a stringified <b>JSON</b> to the file,</li>
 *      <li>And <code>encoding</code> is the output encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 * @param {function} onFileWritten The <strong>nodeback</strong> <code>fn(err, data)</code> to
 *      execute when write operation to the file finishes.
 *
 * @returns {undefined} Nothing.
 */
const writeFileAndCreatePathIfNeeded = ( path, data, options, onFileWritten ) => {
    if ( !path ) {return;}

    mkdirp( dirname( path ), ( err ) => {
        if ( err ) {
            onFileWritten( err, null );

            return;
        }

        writeFileFs( path, data, options, onFileWritten );
    } );
};

/**
 * Writes to the given file at <code>path</code> and returns a <code>Promise</code> that resolves
 * with the written data itself.
 *
 * Note that this operation truncates the file and overwrites it with <code>data</code>.
 *
 * @param {string} path The path to file.
 * @param {object} data What to write.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: true, encoding: 'utf8' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a `boolean` flag that indicates whether the data is written as
 *          a stringified <b>JSON</b> to the file,</li>
 *      <li>And <code>encoding</code> is the output encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} a <code>Promise</code> that resolves with the content of the file.
 *
 * @see writeTextFile
 */
const writeFile = ( path, data, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
    if ( !path ) {
        reject( {
            error: null,
            reason: 'Unsupported `path`. Make sure that `path` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    const json = typeof options.json !== 'undefined' ? options.json : defaultOptions.json;
    const encoding = typeof options.encoding !== 'undefined' ? options.encoding : defaultOptions.encoding;

    writeFileAndCreatePathIfNeeded( path, stringify( data, json ), { encoding }, ( err ) => {
        if ( err ) {
            reject( { error: err, reason: `Unable to write to path: “${path}”.` } );

            return;
        }

        resolve( parse( data, json ) );
    } );
} );

/**
 * Writes a file with an assumption that the `data` passed is a plain UTF-8 text and <strong>not</strong> JSON.
 *
 * @param {string} path The path to file.
 * @param {object} data What to write.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: false, encoding: 'utf8' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a `boolean` flag that indicates whether the data is written as
 *          a stringified <b>JSON</b> to the file,</li>
 *      <li>And <code>encoding</code> is the output encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} a <code>Promise</code> that resolves with the content of the file.
 *
 * @see writeFile
 */
const writeTextFile = ( path, data, options = defaultTextFileOptions ) => writeFile( path, data, options );

/**
 * Creates a file if the file does not exist, populating the file with an optional <code>seed</code> value.
 *
 * @param {string} path The path to the file.
 * @param {object} seed what to put into the file initially.
 * @param {boolean} json <code>true</code> if the data we are persisting to the file is meant to be saved as JSON,
 *      <code>false</code> otherwise.
 *
 * @returns {Promise} a <code>Promise</code> that resolves with <code>{ existedBefore, created, error, reason }</code>;
 *     where…
 *
 *     <ul>
 *     <li><code>existedBefore</code> is <code>true</code> if the file was there before.</li>
 *     <li><code>created</code> is <code>true</code> if file was created successfully.</li>
 *     <li><code>error</code> and <code>reason</code> are populated if something bad happens.</li>
 *     <ul>
 */
const createIfNotExists = ( path, seed, json = true ) => new Promise( ( resolve, reject ) => {
    if ( !path ) {
        reject( {
            error: null,
            reason: 'Unsupported `path`. Make sure that `path` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    access( path, F_OK, ( err ) => {
        if ( err ) {
            writeFile( path, seed, { json } )
                .then( () => resolve( { existedBefore: false, created: true } ) )
                .catch(
                    ( { error, reason } ) =>
                    reject( { existedBefore: false, created: false, error, reason } )
                );

            return;
        }

        resolve( { existedBefore: true, created: false } );
    } );
} );

/**
 * Reads the given file at <code>path</code> as a binary blob and returns
 * a <code>Promise</code> that resolves with the content of the file as a <code>Buffer</code>.
 *
 * @param {string} path The path to the file.
 *
 * @returns {Promise} A <code>Promise</code> that resolves with the content of the file as a <code>Buffer</code>.
 */
const readBinary = ( path ) => new Promise( ( resolve, reject ) => {
    if ( !path ) {
        reject( {
            error: null,
            reason: 'Unsupported `path`. Make sure that `path` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    readFileFs( path, ( err, response ) => {
        if ( err ) {
            if ( err.code === NO_ENTRY ) {
                reject( { error: err, reason: `File “${path}” does not exist.` } );

                return;
            }

            reject( { error: err, reason: `File “${path}” triggered an unexpected error.` } );

            return;
        }

        resolve( response );
    } );
} );

/**
 * Reads the given file at <code>path</code> and returns a <code>Promise</code> that resolves with the
 * content of the file.
 *
 * @param {string} path The path to the file to read.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: true, createIfNotExists: true, encoding: 'utf8', seed: '' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a flag to parse the file as JSON,</li>
 *      <li><code>createIfNotExists</code> creates the file, if it does not exists with the provided
 *          <code>seed</code> value (<em>the default seed is an empty string</em>),
 *      <li>And <code>encoding</code> is the input encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} A <code>Promise</code> that resolves with the content of the file.
 *
 * @see readTextFile
 */
const readFile = ( path, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
    if ( !path ) {
        reject( {
            error: null,
            reason: 'Unsupported `path`. Make sure that `path` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    const seed = typeof options.seed !== 'undefined' ? options.seed : defaultOptions.seed;
    const encoding = typeof options.encoding !== 'undefined' ? options.encoding : defaultOptions.encoding;
    const create = typeof options.createIfNotExists !== 'undefined' ?
        options.createIfNotExists : defaultOptions.createIfNotExists;
    const json = typeof options.json !== 'undefined' ? options.json : defaultOptions.json;

    readFileFs( path, { encoding }, ( err, response ) => {
        if ( err ) {
            if ( err.code === NO_ENTRY ) {
                if ( create ) {
                    resolve( createIfNotExists( path, seed, json ).then( () => parse( seed, json ) ) );

                    return;
                }

                reject( { error: err, reason: `File “${path}” does not exist, and force-creation is disabled.` } );

                return;
            }

            reject( { error: err, reason: `File “${path}” triggered an unexpected error.` } );

            return;
        }

        const result = response.trim();

        resolve( parse( result || seed, json ) );
    } );
} );

/**
 * Reads the given file at <code>path</code> with an assumption that it is a non-JSON text file
 * and returns a <code>Promise</code> that resolves with the content of the file.
 *
 * @param {string} path The path to the file to read.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: false, createIfNotExists: true, encoding: 'utf8', seed: '' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a flag to parse the file as JSON,</li>
 *      <li><code>createIfNotExists</code> creates the file, if it does not exists with the provided
 *          <code>seed</code> value (<em>the default seed is an empty string</em>),
 *      <li>And <code>encoding</code> is the input encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} A <code>Promise</code> that resolves with the content of the file.
 *
 * @see readFile
 */
const readTextFile = ( path, options = defaultTextFileOptions ) => readFile( path, options );

/**
 * Takes a binary <code>Buffer</code> (<code>data</code>) and writes it to the given file
 * at <code>path</code> and then returns a <code>Promise</code> that resolves with the written data
 * itself.
 *
 * Note that this operation truncates the file and overwrites it with <code>data</code>.
 *
 * @param {string} path The path to the file.
 * @param {Buffer} data What to write.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: true, encoding: 'utf8' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a flag to push the data as stringified JSON to the file,</li>
 *      <li>And <code>encoding</code> is the output encoding of the file
 *          (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} A <code>Promise</code> that resolves with the content of the file.
 */
const writeBinary = ( path, data ) => new Promise( ( resolve, reject ) => {
    if ( !path ) {
        reject( {
            error: null,
            reason: 'Unsupported `path`. Make sure that `path` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    writeFileAndCreatePathIfNeeded( path, data, {}, ( err ) => {
        if ( err ) {
            reject( { error: err, reason: `Unable to write to “${path}”.` } );

            return;
        }

        resolve( data );
    } );
} );

/**
 * Takes a collection of paths and returns which of those paths do not point to files on the filesystem
 * (<em>i.e., which of those files are missing</em>).
 *
 * @param {string[]} paths The list of paths to validate.
 *
 * @returns {Promise} A <code>Promise</code> that resolves with a <code>string[]</code> of all the missing
 * paths (<em>which will be a subset of the input array <code>paths</code></em>).
 */
const missingFiles = ( paths ) => Promise.all(
    paths.map( ( path ) =>
        new Promise( ( resolve ) => {
            if ( !path ) {
                resolve( { path, exists: false } );

                return;
            }

            access( path, F_OK, ( err ) => {
                if ( err ) {
                    resolve( { path, exists: false } );

                    return;
                }

                resolve( { path, exists: true } );
            } );
        } )
    )
).then(
    ( results ) =>
    results
        .filter( ( result ) => !result.exists )
        .map( ( result ) => result.path )
);

/**
 * @private
 *
 * This method is private. It is <strong>not</strong> exported, and it is <strong>not</strong>
 * meant for public use.
 *
 * @param {string} filePath Path to the file.
 *
 * @returns {boolean} <code>true</code> if the file is a hidden file; <code>false</code> otherwise.
 */
const hidden = ( filePath ) => filePath[ 0 ] === '.';

/**
 * Gets the stats of the file and resolves with a <code>Promise</code> that wraps the stats.
 *
 * @param {string} filePath The path to the file.
 *
 * @returns {Promise} a <code>Promise</code> that resolves with <code>{ stats, path }</code>
 *     where…
 *
 *     <ul>
 *     <li><code>stat</code> is a Node.JS file stat object.</li>
 *     <li><code>path</code> is the path to the file.</li>
 *     </ul>
 *
 * @see exists
 */
const stat = ( filePath ) => new Promise( ( resolve, reject ) => {
    if ( !filePath ) {
        reject( {
            error: null,
            reason: 'Unsupported `filePath`. Make sure that `filePath` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    statFs( filePath, ( err, fileStat ) => {
        if ( err ) {
            reject( { error: err, reason: `Unable to stat “${filePath}”.` } );

            return;
        }

        resolve( { stat: fileStat, path: filePath } );
    } );
} );

/**
 * Checks whether the file in <code>filePath</code> exists.
 *
 * The <code>Promise</code> that this function returns <strong>always resolves</strong>;
 * it <strong>never</strong> rejects. — When the file is not found, it will resolve with a
 * <code>{ exists: false }</code>.
 *
 * @param {string} filePath The path to the file.
 *
 * @returns {Promise} a <code>Promise</code> that resolves with <code>{ exists, path }</code>, where…
 *
 *    <ul>
 *    <li><code>exists</code> is <code>true</code> if the file exists.</li>
 *    <li><code>path</code> contains the path to the file.
 *    </ul>
 *
 * @see stat
 */
const exists = ( filePath ) => new Promise( ( resolve, reject ) => {
    if ( !filePath ) {
        reject( {
            error: null,
            reason: 'Unsupported `filePath`. Make sure that `filePath` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    statFs( filePath, ( err, fileStat ) => {
        if ( err ) {
            resolve( { exists: false, stat: null, reason: err } );

            return;
        }

        resolve( { exists: true, stat: fileStat, path: filePath } );
    } );
} );

/**
 * Returns a <code>Promise</code> that resolves witha directory list in the form of <code>[ { directory, path } ]</code>
 * given a <code>rootDir</code>.
 *
 * @param {string} rootDir The path to the root directory.
 *
 * @returns {Promise} A <code>Promise</code> taht resolves with an <code>[]</code> of
 *     <code>{ stat, path }</code> objects where…
 *
 *     <ul>
 *     <li><code>stat</code> is a Node.JS file stat object.</li>
 *     <li><code>path</code> is the path to the file.</li>
 *     </ul>
 */
const directories = ( rootDir ) => new Promise( ( resolve, reject ) => {
    if ( !rootDir ) {
        reject( {
            error: null,
            reason: 'Unsupported `rootDir`. Make sure that `rootDir` is a non-empty `string` or a `Buffer`.'
        } );

        return;
    }

    readdir( rootDir, ( err, files ) => {
        if ( err ) {
            reject( { error: err, reason: `Unable to stat the root directory “${rootDir}”.` } );

            return;
        }

        resolve(
            Promise.all(
                files
                    .filter( invert( hidden ) )
                    .map( ( file ) => stat( join( rootDir, file ) ) )
            ).then( ( stats ) => stats.filter( ( { stat: fileStat } ) => fileStat.isDirectory() ) )
        );
    } );
} );

module.exports = {
    createIfNotExists,
    directories,
    exists,
    missingFiles,
    readBinary,
    readFile,
    readTextFile,
    stat,
    writeBinary,
    writeFile,
    writeTextFile
};
