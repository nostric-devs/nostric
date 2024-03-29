import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKMarker, nostrHandler } from "$lib/nostr";
import TreeModel from "tree-model";

export type NodeEvent = TreeModel.Node<NDKEvent>;
export type NodeEvents = { [key: string]: NodeEvent };

const tree: TreeModel = new TreeModel({
  modelComparatorFn: (x: NDKEvent, y: NDKEvent): boolean =>
    y.created_at > x.created_at,
});

export const isMarkerInTags = (
  tags: NDKTag[],
  marker: NDKMarker,
): string | undefined => {
  const tag: NDKTag | undefined = tags.find(
    (tag: NDKTag): boolean => tag.at(3) === marker,
  );
  return tag?.at(1);
};

export const recursiveParentLookUp = async (
  localFeed: NodeEvents,
  event: NDKEvent,
): Promise<void> => {
  if (event?.id && !(event?.id in localFeed)) {
    // first we need to check whether this is event is a reply,
    // which is determined by the presence of an "#e" tag with "root" marker
    // if it is a reply, it might be a reply to a reply, which is
    // determined by the presence of an "#e" tag with "reply" marker
    const tags: NDKTag[] = event.getMatchingTags("e");
    let parentEventId: string | undefined =
      isMarkerInTags(tags, NDKMarker.REPLY) ||
      isMarkerInTags(tags, NDKMarker.ROOT);

    if (parentEventId === undefined && tags.length > 0) {
      // looking for the deprecated part of NIP-10, which does not use markers
      // the last e tag is always the event being replied to.
      parentEventId = tags.at(-1)[1];
    }

    const nodeEvent: NodeEvent = tree.parse(event);

    if (parentEventId === undefined) {
      // this event is not a reply, we parse it (recurse ending point for root node)
      localFeed[event.id] = nodeEvent;
    } else {
      // this event is a reply, and its parent is not yet processed,
      // thus we fetch the event from Nostr and recurse
      if (!(parentEventId in localFeed)) {
        const parentEvent: NDKEvent = (
          await nostrHandler.fetchEventsByFilter({ ids: [parentEventId] })
        ).at(0);

        await recursiveParentLookUp(localFeed, parentEvent);
      }
      // event.id could have been added by another event at this time, need to check
      if (localFeed[parentEventId] && !(event.id in localFeed)) {
        // we add the child to the parent and mark the event as parsed (recurse ending point for reply of a reply)
        localFeed[parentEventId].addChild(nodeEvent);
        localFeed[event.id] = nodeEvent;
      }
    }
  }
};

function getFeed() {
  const feed: Writable<NodeEvents> = writable<NodeEvents>({});
  const { subscribe, update, set } = feed;

  const countFeedEvents = (): number => Object.keys(get(feed)).length;
  const isFeedEmpty = (): boolean => countFeedEvents() === 0;

  const addRecursively = async (event: NDKEvent): Promise<void> => {
    const localFeed: NodeEvents = get(feed);
    await recursiveParentLookUp(localFeed, event);
    update((_: NodeEvents): NodeEvents => localFeed);
  };

  const clear = () => set({});

  return {
    subscribe,
    addRecursively,
    isFeedEmpty,
    clear,
  };
}

export const feed = getFeed();
