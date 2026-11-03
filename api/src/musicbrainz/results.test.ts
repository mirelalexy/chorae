import assert from "node:assert/strict";
import { test } from "node:test";
import { newestAlbumsFirst, toAlbumResults } from "./results";
import { type ReleaseGroup } from "./types";

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
        "artist-credit": credit("Olivia Rodrigo") 
    };
}

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