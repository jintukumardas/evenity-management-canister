import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, nat } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Event = Record<{
    id: string;
    eventName: string;
    assetDescription: string;
    ownerId: string;
    startDate: string;
    endDate: string;
    status: string;
    eventTime: string;
    maxNFTs: string;
    image: string;
}>;

type EventPayload = Record<{
    eventName: string;
    assetDescription: string;
    ownerId: string;
    status: string;
    endDate: string;
    startDate: string;
    eventTime: string;
    maxNFTs: string;
    image: string;
}>;

type NFT = Record<{
    id: string,
    eventId: string,
    imageUrl: string,
    owner: string,
    used: boolean
}>;

const eventStorage = new StableBTreeMap<string, Event>(1, 44, 1024);
const nftStorage = new StableBTreeMap<string, NFT>(2, 44, 1024);


/**
 * Creates a new event.
 * @param payload - Information about the event.
 * @returns A Result containing the new event or an error message.
 */
$update;
export function createEvent(payload: EventPayload): Result<Event, string> {
    try {
        // Validate payload
        if (!payload.eventName || !payload.assetDescription|| !payload.status) {
            return Result.Err<Event, string>('Incomplete input data!');
        }

        // Generate a unique ID for the event
        const eventId = uuidv4();
        // Set each property for better performance
        const newEvent: Event = {
            id: eventId,
            eventName: payload.eventName,
            assetDescription: payload.assetDescription,
            ownerId: payload.ownerId,
            startDate: payload.startDate,
            status: payload.status,
            endDate: payload.endDate,
            eventTime: payload.eventTime,
            maxNFTs: payload.maxNFTs,
            image: payload.image,
        };

        if(parseInt(newEvent.maxNFTs,10) > 0)
            mintNFTs(newEvent) //Mint NFTs for the event

        // Add the event to eventStorage
        eventStorage.insert(newEvent.id, newEvent);

        return Result.Ok(newEvent);
    } catch (error) {
        return Result.Err<Event, string>('Failed to create event!');
    }
}

function mintNFTs(event: Event) {
    let numberOfNFTsToMint = parseInt(event.maxNFTs, 10);
    for (let i = 0; i < numberOfNFTsToMint; i++) {
        let newNft: NFT = {
            id: uuidv4(),
            eventId: event.id,
            imageUrl: event.image,
            owner: event.ownerId,
            used: false
        };
        nftStorage.insert(newNft.id, newNft);
    }
}


/**
 * Retrieves all NFTs.
 * @returns A Result containing a list of all NFTs or an error message.
 */
$query;
export function getAllNFTs(): Result<Vec<NFT>, string> {
    try {
        const allNFTs = nftStorage.values();
        return Result.Ok(allNFTs);
    } catch (error) {
        return Result.Err<Vec<NFT>, string>('Failed to retrieve all NFTs');
    }
}


/**
 * Retrieves NFTs for a specific event by ID.
 * @param eventId - The ID of the event to retrieve NFTs for.
 * @returns A Result containing a list of NFTs or an error message.
 */
$query;
export function getNFTsForEventForUser(eventId: string, userId: string): Result<Vec<NFT>, string> {
    // Validate IDs
    // if (!isValidUUID(eventId) || !isValidUUID(userId)) {
    //     return Result.Err<Vec<NFT>, string>('Invalid event ID or user ID');
    // }
    try {
        const nfts = nftStorage.values().filter(nft => nft.eventId === eventId && nft.owner === userId);
        return Result.Ok(nfts);
    } catch (error) {
        return Result.Err('Failed to get NFTs for the event for the user');
    }
}


/**
 * Buys NFTs for a specific event.
 * @param eventId - The ID of the event to buy NFTs for.
 * @param ownerId - The ID of the buyer.
 * @param quantity - The number of NFTs to buy.
 * @returns A Result containing the purchased NFTs or an error message.
 */
$update;
export function buyNFTsForEvent(eventId: string, ownerId: string, quantity: number): Result<Vec<NFT>, string> {
    // Validate IDs and quantity
    // if (!isValidUUID(eventId) || !isValidUUID(ownerId) || quantity <= 0) {
    //     return Result.Err<Vec<NFT>, string>('Invalid event ID, owner ID, or quantity for buying NFTs.');
    // }
    try {
        const nftsToBuy = nftStorage.values().filter(nft => nft.eventId === eventId && !nft.used).slice(0, quantity);
        if (nftsToBuy.length < quantity) {
            return Result.Err<Vec<NFT>, string>('Not enough available NFTs for this event.');
        }

        // Update NFT ownership and usage status
        nftsToBuy.forEach(nft => {
            nft.owner = ownerId;
            nft.used = true;
            nftStorage.insert(nft.id, nft);
        });

        //Update maxNFTs for the event
        const event = eventStorage.get(eventId);
        if (event?.Some) {
            event.Some.maxNFTs = (parseInt(event.Some.maxNFTs, 10) - quantity).toString();
            eventStorage.insert(eventId, event.Some);
        }   
        return Result.Ok(nftsToBuy);
    } catch (error) {
        return Result.Err<Vec<NFT>, string>('Failed to buy NFTs for the event');
    }
}

/**
 * Verifies NFTs bought for a specific event.
 * @param eventId - The ID of the event to verify NFTs for.
 * @param nftIds - The IDs of the NFTs to verify.
 * @returns A Result containing the verified NFTs or an error message.
 */
$query;
export function verifyNFTsForEvent(eventId: string, nftId: string): Result<Vec<NFT>, string> {
    // Validate IDs and nftIds
    if (!isValidUUID(eventId) || !isValidUUID(nftId)) {
        return Result.Err<Vec<NFT>, string>('Invalid event ID or NFT IDs for verifying NFTs.');
    }

    try {
        const verifiedNFTs = nftStorage.values().filter(nft => nft.eventId === eventId && nftId  === nft.id);
        if (verifiedNFTs.length !== 0) {
            return Result.Err<Vec<NFT>, string>('Invalid NFT for this event.');
        }
        return Result.Ok(verifiedNFTs);
    } catch (error) {
        return Result.Err<Vec<NFT>, string>('Failed to verify NFTs for the event');
    }
}


/**
 * Retrieves all events from the system.
 * @returns A Result containing a list of events or an error message.
 */
$query;
export function getAllEvents(): Result<Vec<Event>, string> {
    try {
        return Result.Ok(eventStorage.values());
    } catch (error) {
        return Result.Err('Failed to get events');
    }
}

/**
 * Retrieves a specific event by ID.
 * @param eventId - The ID of the event to retrieve.
 * @returns A Result containing the event or an error message.
 */
$query;
export function getEventById(eventId: string): Result<Event, string> {
    // Validate ID
    if (!isValidUUID(eventId)) {
        return Result.Err<Event, string>('Invalid event ID');
    }

    return match(eventStorage.get(eventId), {
        Some: (event) => Result.Ok<Event, string>(event),
        None: () => Result.Err<Event, string>(`Event with the provided id: ${eventId} has not been found!`),
    });
}

/**
 * Retrieves all events owned by a specific owner.
 * @param ownerId - The ID of the owner.
 * @returns A Result containing a list of events or an error message.
 */
$query;
export function getOwnersEvents(ownerId: string): Result<Vec<Event>, string> {
    // Validate ID
    if (!isValidUUID(ownerId)) {
        return Result.Err<Vec<Event>, string>('Invalid owner ID');
    }

    try {
        return Result.Ok(eventStorage.values().filter((event) => event.ownerId === ownerId));
    } catch (error) {
        return Result.Err(`Failed to retrieve events for owner with ID ${ownerId}!`);
    }
}

/**
 * Retrieves events based on their status.
 * @param status - The status to filter events.
 * @returns A Result containing a list of events or an error message.
 */
$query;
export function getEventsByStatus(status: string): Result<Vec<Event>, string> {
    try {
        // Validate status
        if (!isEventStatusValid(status)) {
            return Result.Err(`Invalid event status: ${status}`);
        }

        const events: Vec<Event> = eventStorage.values().filter((event) => {
            return event.status == status;
        });

        return Result.Ok(events);
    } catch (error) {
        return Result.Err('Failed to retrieve events!');
    }
}

/**
 * Updates information for a specific event.
 * @param eventId - The ID of the event to update.
 * @param ownerId - The ID of the owner making the update.
 * @param payload - Updated information about the event.
 * @returns A Result containing the updated event or an error message.
 */

$update;
export function updateEvent(eventId: string, ownerId: string, payload: EventPayload): Result<Event, string> {
    // Validate IDs
    if (!isValidUUID(eventId) || !isValidUUID(ownerId)) {
        return Result.Err<Event, string>('Invalid event or owner ID for updating an event.');
    }

    return match(eventStorage.get(eventId), {
        Some: (event) => {
            // Validate ownership
            if (event.ownerId !== ownerId) {
                return Result.Err<Event, string>('Only the owner can update this event!');
            }

            // Set each property for better performance
            const updatedEvent: Event = {
                id: event.id,
                eventName: payload.eventName || event.eventName,
                assetDescription: payload.assetDescription || event.assetDescription,
                ownerId: payload.ownerId,
                startDate: payload.startDate || event.startDate,
                status: payload.status || event.status,
                endDate: payload.endDate || event.endDate,
                eventTime: payload.eventTime || event.eventTime,
                maxNFTs: payload.maxNFTs || event.maxNFTs,
                image: payload.image || event.image,
            };

            // Update the event in eventStorage
            eventStorage.insert(event.id, updatedEvent);

            return Result.Ok<Event, string>(updatedEvent);
        },
        None: () => Result.Err<Event, string>(`Failed to update event with id: ${eventId}!`),
    });
}

/**
 * Ends a specific event.
 * @param eventId - The ID of the event to end.
 * @param ownerId - The ID of the owner ending the event.
 * @returns A Result containing the ended event or an error message.
 */
$update;
export function endEvent(eventId: string, ownerId: string): Result<Event, string> {
    // Validate IDs
    if (!isValidUUID(eventId) || !isValidUUID(ownerId)) {
        return Result.Err<Event, string>('Invalid event or owner ID for ending an event.');
    }

    return match(eventStorage.get(eventId), {
        Some: (event) => {
            // Validate ownership
            if (event.ownerId !== ownerId) {
                return Result.Err<Event, string>('Only the owner can end this event!');
            }

            // Validate if the event has already ended
            if (BigInt(event.endDate) >= ic.time()) {
                return Result.Err<Event, string>('Event already ended!');
            }

            // Set each property for better performance
            const endedEvent: Event = {
                id: event.id,
                eventName: event.eventName,
                assetDescription: event.assetDescription,
                ownerId: event.ownerId,
                startDate: event.startDate,
                endDate: ic.time().toString(),
                status: 'inactive',
                eventTime: 'ended',
                maxNFTs: '0',
                image: '',
            };

            // Update the event in eventStorage
            eventStorage.insert(event.id, endedEvent);

            return Result.Ok<Event, string>(endedEvent);
        },
        None: () => Result.Err<Event, string>(`Failed to end event with id: ${eventId}!`),
    });
}

/**
 * Deletes a specific event.
 * @param eventId - The ID of the event to delete.
 * @param ownerId - The ID of the owner deleting the event.
 * @returns A Result containing the deleted event or an error message.
 */
$update;
export function deleteEvent(eventId: string, ownerId: string): Result<Event, string> {
    // Validate IDs
    if (!isValidUUID(eventId) || !isValidUUID(ownerId)) {
        return Result.Err<Event, string>('Invalid event or owner ID for deleting an event.');
    }

    return match(eventStorage.remove(eventId), {
        Some: (event) => {
            // Validate ownership
            if (event.ownerId !== ownerId) {
                return Result.Err<Event, string>('Only owner can delete event!');
            }

            return Result.Ok<Event, string>(event);
        },
        None: () => Result.Err<Event, string>(`Failed to delete event with id: ${eventId}`),
    });
}

/**
 * Checks if an event status is valid.
 * @param status - The event status to validate.
 * @returns True if the status is valid, otherwise false.
 */
function isEventStatusValid(status: string): boolean {
    return status === 'active' || status === 'inactive';
}

// A workaround to make the uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};

/**
 * Validates whether a given string is a valid UUID.
 * @param id - The string to validate as a UUID.
 * @returns True if the string is a valid UUID, otherwise false.
 */
export function isValidUUID(id: string): boolean {
    // Validate if the provided ID is a valid UUID
    return /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(id); 
    // Example of a valid UUID: 123e4567-e89b-12d3-a456-426614174000
}
