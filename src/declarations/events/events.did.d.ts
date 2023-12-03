import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Event {
  'id' : string,
  'status' : string,
  'endDate' : string,
  'ownerId' : string,
  'assetDescription' : string,
  'image' : string,
  'maxNFTs' : string,
  'eventName' : string,
  'startDate' : string,
  'eventTime' : string,
}
export interface EventPayload {
  'status' : string,
  'endDate' : string,
  'ownerId' : string,
  'assetDescription' : string,
  'image' : string,
  'maxNFTs' : string,
  'eventName' : string,
  'startDate' : string,
  'eventTime' : string,
}
export interface NFT {
  'id' : string,
  'eventId' : string,
  'owner' : string,
  'used' : boolean,
  'imageUrl' : string,
}
export type _AzleResult = { 'Ok' : Array<NFT> } |
  { 'Err' : string };
export type _AzleResult_1 = { 'Ok' : Event } |
  { 'Err' : string };
export type _AzleResult_2 = { 'Ok' : Array<Event> } |
  { 'Err' : string };
export interface _SERVICE {
  'buyNFTsForEvent' : ActorMethod<[string, string, number], _AzleResult>,
  'createEvent' : ActorMethod<[EventPayload], _AzleResult_1>,
  'deleteEvent' : ActorMethod<[string, string], _AzleResult_1>,
  'endEvent' : ActorMethod<[string, string], _AzleResult_1>,
  'getAllEvents' : ActorMethod<[], _AzleResult_2>,
  'getAllNFTs' : ActorMethod<[], _AzleResult>,
  'getEventById' : ActorMethod<[string], _AzleResult_1>,
  'getEventsByStatus' : ActorMethod<[string], _AzleResult_2>,
  'getNFTsForEventForUser' : ActorMethod<[string, string], _AzleResult>,
  'getOwnersEvents' : ActorMethod<[string], _AzleResult_2>,
  'updateEvent' : ActorMethod<[string, string, EventPayload], _AzleResult_1>,
  'verifyNFTsForEvent' : ActorMethod<[string, string], _AzleResult>,
}
