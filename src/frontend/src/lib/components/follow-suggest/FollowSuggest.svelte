<script>
  import { Avatar } from "@skeletonlabs/skeleton";
  import { UserPlus } from "svelte-feathers";

  let profiles = [
    {
      username: "jack",
      npub: "npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m",
      pubkey: "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
      img: "https://nostr.build/i/p/nostr.build_6b9909bccf0f4fdaf7aacd9bc01e4ce70dab86f7d90395f2ce925e6ea06ed7cd.jpeg"
    },
    {
      username: "Will",
      npub: "npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s",
      pubkey: "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
      img: "https://cdn.jb55.com/img/red-me.jpg"
    },
    {
      username: "ODELL",
      npub: "npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx",
      pubkey: "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
      img: "https://werunbtc.com/p.webp"
    },
    {
      username: "fiatjaf",
      npub: "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6",
      pubkey: "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
      img: "https://fiatjaf.com/static/favicon.jpg"
    },
    {
      username: "Snowden",
      npub: "npub1sn0wdenkukak0d9dfczzeacvhkrgz92ak56egt7vdgzn8pv2wfqqhrjdv9",
      pubkey: "84dee6e676e5bb67b4ad4e042cf70cbd8681155db535942fcc6a0533858a7240",
      img: "https://nostr.build/i/p/6838p.jpeg"
    },
    {
      username: "LynAldenContact",
      npub: "npub1a2cww4kn9wqte4ry70vyfwqyqvpswksna27rtxd8vty6c74era8sdcw83a",
      pubkey: "eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f",
      img: "https://void.cat/d/E4vpXkn515rhcDsFa7umMr.webp"
    },
    {
      username: "PlanB",
      npub: "npub15wcvuhts6rdj9zzhq6etru2yc6ry5ljg9zk070u0q89xk065452sjvqy0q",
      pubkey: "a3b0ce5d70d0db22885706b2b1f144c6864a7e4828acff3f8f01ca6b3f54ad15",
      img: "https://planbtc.com/images/pet.jpg"
    },
    {
      username: "gladstein",
      npub: "npub1trr5r2nrpsk6xkjk5a7p6pfcryyt6yzsflwjmz6r7uj7lfkjxxtq78hdpu",
      pubkey: "58c741aa630c2da35a56a77c1d05381908bd10504fdd2d8b43f725efa6d23196",
      img: "https://sps.columbia.edu/sites/default/files/styles/card_square_270x270_medium_1x/public/2022-06/1576737889853.jpg?h=5316ccab&itok=0JSGy3MH"
    },    
  ]
</script>

<h3 class="h3 my-6">People to follow</h3>
<div class="follow-suggest">
  {#each profiles as profile}
    <div
      class="post-head mx-auto my-4 flex md:flex-row flex-col justify-between items-start"
    >
      <!-- Avatar, Username and Link -->
      <a href="/user/{profile.pubkey}" class="flex items-start">
        <div>
          <Avatar
            src="{profile.img}"
            class="mr-4 mt-1"
            initials="LV"
            width="w-10"
            background="bg-primary-500"
          />
        </div>
        <div>
          <div class="font-bold">{profile.username}</div>
          <span class="text-sm username truncate">{profile.npub}</span>
        </div>
      </a>

      <!-- Follow Button -->
      <button type="button" class="btn variant-filled-primary font-normal">
        <span>
          <UserPlus size="16" class="lg:mx-auto xl:mx-0"></UserPlus>
        </span>
        <span class="text-sm"> Follow </span>
      </button>
    </div>
  {/each}
</div>


<style>
  .truncate {
    display: inline-block; /* Changed to inline-block */
    max-width: 180px; /* Use max-width for flexibility */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>