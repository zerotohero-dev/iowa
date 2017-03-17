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

/** @module iowa */

const {
    readFile: readFileFs,
    writeFile: writeFileFs,
    access,
    constants: { F_OK }
} = require( 'fs' );

const stringify = ( data, json = true ) => (
    ( json && typeof data === 'object' ) ? JSON.stringify( data ) : ( '' + data ).trim()
).trim();

const parse = ( response, json = true ) => (
    ( json && typeof response === 'string' ) ? JSON.parse( response ) : response
);

const createIfNotExists = ( path, seed, json = true ) => new Promise( (resolve, reject ) =>
    access( path, F_OK, ( err ) => {
        if ( err ) {
            resolve( writeFile( path, seed, { json } ) );

            return;
        }

        resolve( true );
    } )
);

const defaultOptions = { json: true, createIfNotExists: true, encoding: 'utf8', seed: '' };

/**
 * Reads the given file and returns a <code>Promise</code> that resolves with the contents of the file.
 *
 * @param {string} path The path to file.
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
 * @returns {Promise} A <code>Promise</code> that resolves with the contents of the file.
 */
const readFile = ( path, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
    const seed = typeof options.seed !== 'undefined' ? options.seed : defaultOptions.seed;
    const encoding = typeof options.encoding !== 'undefined' ? options.encoding : defaultOptions.encoding;
    const create = typeof options.createIfNotExists !== 'undefined' ?
        options.createIfNotExists : defaultOptions.createIfNotExists;
    const json = typeof options.json !== 'undefined' ? options.json : defaultOptions.json;

    readFileFs(
        path, { encoding },
        ( err, response ) => {
            if ( err ) {
                if ( err.code === 'ENOENT' && create ) {
                    resolve( createIfNotExists( path, seed, json ).then( () => parse( seed, json ) ) );

                    return;
                }

                reject( { error: err, reason: `File “${path}” triggered and unexpected error.` } );

                return;
            }

            const result = response.trim();

            resolve( parse( result ? result : seed, json ) );
        }
    );
} );

/**
 * Reads the given file as a binary blob a <code>Promise</code> that resolves with the contents of the file
 * (as a <code>Buffer</code>).
 *
 * @param {string} The path The path to file.
 *
 * @returns {Promise} A <code>Promise</code> that resolves with the contents of the file as a <code>Buffer</code>.
 */
const readBinary = ( path ) => new Promise( ( resolve, reject ) => {
    readFileFs(
        path,
        ( err, response ) => {
            if ( err ) {
                if ( err.code === 'ENOENT' ) {
                    reject( { error: err, reason: `File “${path}” does not exist.` } );

                    return;
                }

                reject( { error: err, reason: `File “${path}” triggered and unexpected error.` } );

                return;
            }

            resolve( parse( result ? result : seed, json ) );
        }
    );
} );

/**
 * Writes to the given file and returns a <code>Promise</code> that resolves with the written data itself.
 *
 * Note that this operation truncates the file and overwrites it with `data`.
 *
 * @param {string} path The path to file.
 * @param {object} data What to write.
 * @param {object} options (Optional) configuration options,
 *      defaults to <code>{ json: true, encoding: 'utf8' }</code>,
 *
 *      where…
 *
 *      <ul>
 *      <li><code>json</code> is a flag to push the data as stringified JSON to the file,</li>
 *      <li>And <code>encoding</code> is the output encoding of the file
 *         (<em>defaults to <code>"utf8"</code></em>).</li>
 *      </ul>
 *
 * @returns {Promise} a <code>Promise</code> that resolves with the contents of the file.
 */
const writeFile = ( path, data, options = defaultOptions ) => new Promise( ( resolve, reject ) => {
    const json = typeof options.json !== 'undefined' ? options.json : defaultOptions.json;
    const encoding = typeof options.encoding !== 'undefined' ? options.encoding : defaultOptions.encoding;

    writeFileFs(
        path, stringify( data, json ), { encoding },
        ( err ) => {
            if ( err ) {
                reject( { error: err, reason: `Unable to write to path: “${path}”.` }  );

                return;
            }

            resolve( parse( data, json ) );
        }
    );
} );

/**
 * Takes a binary <code>Buffer</code> and writes to the given file and returns a <code>Promise</code>
 * that resolves with the written data itself.
 *
 * Note that this operation truncates the file and overwrites it with <code>data</code>.
 *
 * @param {string} path The path to file.
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
 * @returns {Promise} — a `Promise` that resolves with the contents of the file.
 */
const writeBinary = ( path, data ) => new Promise( ( resolve, reject ) => {
    writeFileFs(
        path, data,
        ( err ) => {
            if ( err ) {
                reject( { error: err, reason: `Unable to write to path: “${path}”.` }  );

                return;
            }

            resolve( data );
        }
    );
} );

/**
 * Takes a collection of paths and returns which of those paths do not point to files on the file system
 * (<em>i.e., which of those files are missing</em>).
 *
 * @param {string[]} paths The list of paths to validate.
 *
 * @returns {Promise} A <code>Promise</code> that resolves with an <code>string[]</code> of all the missing paths
 *      (<em>which will be a subset of the input array <code>paths</code></em>).
 */
const missingFiles = ( paths ) => Promise.all(
    paths.map( ( path ) => new Promise( ( resolve ) => access( path, F_OK, ( err ) => {
        if ( err ) {
            resolve( { path, exists: false } );

            return;
        }

        resolve( { path, exists: true } );
    } ) ) )
).then( ( results ) => results.filter( ( result ) => !result.exists ).map( ( result ) => result.path ) );

module.exports = { readFile, writeFile, writeBinary, readBinary, missingFiles };
