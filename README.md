[![tests][tests]][tests-url]
[![deps][deps]][deps-url]

[tests]: https://img.shields.io/travis/jsbites/iowa.svg
[tests-url]: https://travis-ci.org/jsbites/iowa
[deps]: https://david-dm.org/jsbites/iowa.svg
[deps-url]: https://david-dm.org/jsbites/iowa

```
  __      ______    __   __  ___       __
 |" \    /    " \  |"  |/  \|  "|     /""\
 ||  |  // ____  \ |'  /    \:  |    /    \
 |:  | /  /    ) :)|: /'        |   /' /\  \
 |.  |(: (____/ //  \//  /\'    |  //  __'  \
 /\  |\\        /   /   /  \\   | /   /  \\  \
(__\_|_)\"_____/   |___/    \___|(___/    \___)
```

`iowa` is a library that exposes IO utility methods that return a `Promise` API; it is also known as “the land of corn”.

## About This Repository

This repository is a part of the [Byte-Sized JavaScript VideoCasts][vidcast].

```
  _               __
 |_)   _|_  _ __ (_  o _   _   _|
 |_) \/ |_ (/_   __) | /_ (/__(_|
     /        |  _.     _. (_   _ ._ o ._ _|_
            \_| (_| \/ (_| __) (_ |  | |_) |_
                                       |
            »»  bytesized.tv  ««
```

## Byte-Sized What?!

[Byte-Sized JavaScript][vidcast].

It is a compilation of short (*around ten minutes*) monthly screencasts about **JavaScript** and related technologies.

[vidcast]: https://bytesized.tv/ "ByteSized.TV"

## About **iowa**

`iowa` is a library that exposes IO utility methods that return a `Prmomise` API.

It’s currently used in the CI/CD deployment pipeline of [**bytesized.tv.web**](https://github.com/jsbites/bytesized.tv.web).

I’m adding bits and pieces to it as I need them. Contributions are always welcome.


## Alpha-Stage Software Warning

> `iowa` is in its early stages; so anything in its implementation can change.
>
> Until it hits `version 1.0`, I’ll be liberally introducing breaking changes, please keep that in mind and **fix your versions in your package.json** if you depend on `iowa` in your apps.
>
> Once `iowa` hits `version 1.0`, its API will stabilize, and the changes will be more backwards-compatible, as I will follow the [Semantic Versioning 2.0.0](http://semver.org/spec/v2.0.0.html) standards.

## Installation

Install via `npm`:

```bash
npm install iowa
```

You will need the **current** version of [Node.JS](https://nodejs.org/) with all the bells and whistles — [You can install it from nodejs.org](https://nodejs.org/).

## Usage

Here are a few usage examples:

```
// TODO: add more examples including configuration options

const { readFile, writeFile, missingFiles } from 'iowa';

readFile( 'hello.json' ).then( ( data ) => console.log( data ) );

readFile( 'world.json', { encoding: 'iso-8859-9' ).then( ( data ) => console.log( data ) );

writeFile( 'hello.txt', 'baz' );

missingFiles( [ 'hello.txt', 'world.txt', 'baz.txt' ] ).then( ( missing ) => {

    // Missing will be an array of missing files that do not exist in the file system.
    console.log( missing );
} );

```

## Dependencies

You will need the **current** version of [Node.JS](https://nodejs.org/) with all the bells and whistles — [You can install it from nodejs.org](https://nodejs.org/).

Older versions might work too; though, why stay in the past?

## Package Scripts

Here are the helper npm scripts that you can run via `npm`:

// TODO: update here when there are package scripts.
// TODO: travis integration
// TODO: create tests
// TODO: add eslint.

## Important Files and Folders

* `index.js`: The main entry point.
* `CHANGELOG.md`: A log of what has been done since the last version.
* `CODE_OF_CONDUCT.md`: Tells the collaborators to be nice to each other.
* `README.md`: This very file.

## Wanna Help?

Any help is more than appreciated.

If you want to contribute to the source code, **fork this repository** and **create a pull request**.

> In lieu of a formal style guide, take care to maintain the existing coding style.

Also, don’t forget to add unit tests for any new or changed functionality.

If you want to report a bug; or share a comment or suggestion, [file an issue](https://github.com/iowa/bytesized.tv.app/issues/new).

## I’ve Found a Bug; I Have an Idea

[For bug reports and suggestions, please file an issue](https://github.com/jsbites/iowa/issues/new).

## Contact Information

* **Project Maintainer**: [Volkan Özçelik](https://volkan.io/)
* **Project Website**: [bytesized.tv](https://bytesized.tv)

## License

MIT-licensed. — [See the license file for details](LICENSE.md).

## Code of Conduct

We are committed to making participation in this project a harassment-free experience for everyone, regardless of the level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

[See the code of conduct for details](CODE_OF_CONDUCT.md).
