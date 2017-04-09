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
    access,
    constants: { F_OK }
} = require( 'fs' );

const { dirname } = require( 'path' );

const mkdirp = require( 'mkdirp' );

const parse = ( response, json = true ) =>
    ( json && typeof response === 'string' ) ?
        JSON.parse( response ) :
        ( typeof response === 'string' ? response.trim() : response );

const stringify = ( data, json = true ) => (
    ( json && typeof data === 'object' ) ? JSON.stringify( data ) : `${data}`
).trim();

const defaultOptions = { json: true, createIfNotExists: true, encoding: 'utf8', seed: '' };

const NO_ENTRY = 'ENOENT';

const writeFileAndCreatePathIfNeeded = ( path, data, options, onFileWritten ) => {
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
 */
const writeFile = ( path, data, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
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

const createIfNotExists = ( path, seed, json = true ) => new Promise( ( resolve, reject ) => {
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
const readBinary = ( path ) => new Promise( ( resolve, reject ) =>
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
    } )
);

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
 */
const readFile = ( path, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
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
const writeBinary = ( path, data ) => new Promise( ( resolve, reject ) =>
    writeFileAndCreatePathIfNeeded( path, data, {}, ( err ) => {
        if ( err ) {
            reject( { error: err, reason: `Unable to write to “${path}”.` } );

            return;
        }

        resolve( data );
    } )
);

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
    paths.map( ( path ) => new Promise( ( resolve ) => access( path, F_OK, ( err ) => {
        if ( err ) {
            resolve( { path, exists: false } );

            return;
        }

        resolve( { path, exists: true } );
    } ) ) )
).then(
    ( results ) =>
    results
        .filter( ( result ) => !result.exists )
        .map( ( result ) => result.path )
);

module.exports = { readFile, writeFile, readBinary, writeBinary, missingFiles };
