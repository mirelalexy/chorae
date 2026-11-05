import assert from "node:assert/strict";
import { test } from "node:test";
import { newestAlbumsFirst, toAlbumResults, toSongResults } from "./results";
import { Recording, type ReleaseGroup } from "./types";

const credit = (name: string) => [{ 
    name, 
    joinphrase: "", 
    artist: { 
        id: "a", 
        name 
    } 
}];

function group(id: string, title: string, type: string, secondary: string[] = [], date = "2021-05-21"): ReleaseGroup {
    return { 
        id, 
        title, 
        "primary-type": type, 
        "secondary-types": secondary, 
        "first-release-date": date,
        "artist-credit": credit("Olivia Rodrigo"),
    };
}

function recording(id: string, title: string, artist: string, disambiguation = ""): Recording {
    return { 
        id, 
        title, 
        disambiguation, 
        "first-release-date": "2021-01-08", 
        "artist-credit": credit(artist), 
        releases: [],
    };
}

// Album/EP tests.
test("keeps albums and EPs, drops singles, compilations and live albums", () => {
    const albums = toAlbumResults([
        group("rg-1", "SOUR", "Album"),
        group("rg-2", "drivers license", "Single"),
        group("rg-3", "Live at the Roxy", "Album", ["Live"]),
        group("rg-4", "Spotify Sessions", "EP"),
        group("rg-5", "Hits", "Album", ["Compilation"]),
    ]);
    assert.deepEqual(albums.map((a) => a.title), ["SOUR", "Spotify Sessions"]);
    assert.deepEqual(albums[0], {
        mbid: "rg-1",
        title: "SOUR",
        artist: "Olivia Rodrigo",
        year: "2021",
        type: "Album",
        coverUrl: "https://coverartarchive.org/release-group/rg-1/front-250",
    });
});

test("sorts albums newest first, with undated ones last", () => {
    const albums = toAlbumResults([group("a", "Old", "Album", [], "2019"), group("b", "Undated", "Album", [], ""), group("c", "New", "Album", [], "2023-09-08")]);
    assert.deepEqual(newestAlbumsFirst(albums).map((a) => a.title), ["New", "Old", "Undated"]);
});

// Song tests.
test("one result per song, skipping live versions and remixes", () => {
    const songs = toSongResults(
        [
            recording("r-1", "drivers license", "Olivia Rodrigo"),
            recording("r-2", "drivers license", "Olivia Rodrigo"),
            recording("r-3", "drivers license", "Olivia Rodrigo", "live"),
            recording("r-4", "drivers license (remix)", "Olivia Rodrigo"),
            recording("r-5", "vampire", "Olivia Rodrigo"),
        ],
        "olivia",
    );
    assert.deepEqual(songs.map((s) => s.mbid), ["r-1", "r-5"]);
    assert.equal(songs[0]!.year, "2021");
});

test("asking for a live version keeps it", () => {
    const songs = toSongResults(
        [
            recording("r-3", "drivers license", "Olivia Rodrigo", "live")
        ], 
        "drivers license live"
    );
    assert.equal(songs.length, 1);
});

test("asking for a remix includes remix variants but excludes other versions", () => {
    const songs = toSongResults(
        [
            recording("r-1", "drivers license", "Olivia Rodrigo"),
            recording("r-2", "drivers license (remix)", "Olivia Rodrigo"),
            recording("r-3", "drivers license (live remix)", "Olivia Rodrigo"),
            recording("r-4", "drivers license", "Olivia Rodrigo", "live"),
            recording("r-5", "drivers license (acoustic remix)", "Olivia Rodrigo"),
        ],
        "drivers license remix",
    );

    assert.deepEqual(songs.map((s) => s.mbid), ["r-2", "r-3", "r-5"]);
});

test("asking for multiple versions requires all of them", () => {
    const songs = toSongResults(
        [
            recording("r-1", "drivers license (remix)", "Olivia Rodrigo"),
            recording("r-2", "drivers license (live)", "Olivia Rodrigo"),
            recording("r-3", "drivers license (live remix)", "Olivia Rodrigo"),
        ],
        "drivers license live remix",
    );

    assert.deepEqual(songs.map((s) => s.mbid), ["r-3"]);
});

