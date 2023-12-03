export const idlFactory = ({ IDL }) => {
  const NFT = IDL.Record({
    'id' : IDL.Text,
    'eventId' : IDL.Text,
    'owner' : IDL.Text,
    'used' : IDL.Bool,
    'imageUrl' : IDL.Text,
  });
  const _AzleResult = IDL.Variant({ 'Ok' : IDL.Vec(NFT), 'Err' : IDL.Text });
  const EventPayload = IDL.Record({
    'status' : IDL.Text,
    'endDate' : IDL.Text,
    'ownerId' : IDL.Text,
    'assetDescription' : IDL.Text,
    'image' : IDL.Text,
    'maxNFTs' : IDL.Text,
    'eventName' : IDL.Text,
    'startDate' : IDL.Text,
    'eventTime' : IDL.Text,
  });
  const Event = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'endDate' : IDL.Text,
    'ownerId' : IDL.Text,
    'assetDescription' : IDL.Text,
    'image' : IDL.Text,
    'maxNFTs' : IDL.Text,
    'eventName' : IDL.Text,
    'startDate' : IDL.Text,
    'eventTime' : IDL.Text,
  });
  const _AzleResult_1 = IDL.Variant({ 'Ok' : Event, 'Err' : IDL.Text });
  const _AzleResult_2 = IDL.Variant({
    'Ok' : IDL.Vec(Event),
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'buyNFTsForEvent' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [_AzleResult],
        [],
      ),
    'createEvent' : IDL.Func([EventPayload], [_AzleResult_1], []),
    'deleteEvent' : IDL.Func([IDL.Text, IDL.Text], [_AzleResult_1], []),
    'endEvent' : IDL.Func([IDL.Text, IDL.Text], [_AzleResult_1], []),
    'getAllEvents' : IDL.Func([], [_AzleResult_2], ['query']),
    'getAllNFTs' : IDL.Func([], [_AzleResult], ['query']),
    'getEventById' : IDL.Func([IDL.Text], [_AzleResult_1], ['query']),
    'getEventsByStatus' : IDL.Func([IDL.Text], [_AzleResult_2], ['query']),
    'getNFTsForEventForUser' : IDL.Func(
        [IDL.Text, IDL.Text],
        [_AzleResult],
        ['query'],
      ),
    'getOwnersEvents' : IDL.Func([IDL.Text], [_AzleResult_2], ['query']),
    'updateEvent' : IDL.Func(
        [IDL.Text, IDL.Text, EventPayload],
        [_AzleResult_1],
        [],
      ),
    'verifyNFTsForEvent' : IDL.Func(
        [IDL.Text, IDL.Text],
        [_AzleResult],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
