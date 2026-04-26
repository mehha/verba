import type { Block, Field } from 'payload'

const mediaField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  required: false,
})

const textPairFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
    required: true,
  },
]

export const SuhtlejaHomepage: Block = {
  slug: 'suhtlejaHomepage',
  interfaceName: 'SuhtlejaHomepageBlock',
  labels: {
    singular: 'Suhtleja avaleht',
    plural: 'Suhtleja avalehed',
  },
  fields: [
    {
      name: 'hero',
      label: 'Hero',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Kuva sektsioon',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Eestikeelne suhtluse ja harjutamise keskkond',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Suhtleja aitab lapsel piltide, heli ja mängu kaudu suhelda',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          defaultValue:
            'Eestikeelne keskkond suhtlustahvlite ja lihtsate õppemängude loomiseks. Laps saab turvalises vaates valida pilte, kuulata sõnu ja harjutada oskusi omas tempos.',
        },
        mediaField('image', 'Hero tootepilt või mockup'),
        {
          name: 'primaryCta',
          label: 'Põhinupp',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Alusta kasutamist' },
            { name: 'href', type: 'text', defaultValue: '/register' },
          ],
        },
        {
          name: 'secondaryCta',
          label: 'Teine nupp',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Vaata võimalusi' },
            { name: 'href', type: 'text', defaultValue: '#voimalused' },
          ],
        },
        {
          name: 'highlights',
          label: 'Lühiväärtused',
          type: 'array',
          minRows: 1,
          maxRows: 4,
          defaultValue: [
            { text: 'Suhtlustahvlid igapäevasteks olukordadeks' },
            { text: 'Ühenda punktid mängud harjutamiseks' },
            { text: 'Lapsevaade ja vanemavaade eraldi' },
          ],
          fields: [{ name: 'text', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'video',
      label: 'Video sektsioon',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Kuva sektsioon',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Video',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Vaata, kuidas üks tahvel muutub lapse igapäevaseks abiliseks',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          defaultValue:
            'Lühikeses videos näed, kuidas luua piltidega tahvel, lisada sinna sõnad ja kasutada seda lapsevaates. Sama keskkonna kaudu saab avada ka mängulisi harjutusi.',
        },
        mediaField('poster', 'Video poster või placeholder'),
        mediaField('videoFile', 'Video fail'),
        {
          name: 'embedUrl',
          label: 'Video embed URL',
          type: 'text',
          admin: {
            description: 'Valikuline. Kasuta siis, kui video on YouTube/Vimeo vms keskkonnas.',
          },
        },
        {
          name: 'placeholderLabel',
          label: 'Placeholder tekst',
          type: 'text',
          defaultValue: 'Video lisandub peagi',
        },
      ],
    },
    {
      name: 'features',
      label: 'Võimalused',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Kuva sektsioon',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Võimalused',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Suhtlustahvlid ja harjutused samas kohas',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          defaultValue:
            'Suhtleja ei ole ainult pildipank. See on lapsele lihtne koduvaade, kus vajalikud suhtlustahvlid ja mängulised tegevused on kohe kättesaadavad.',
        },
        {
          name: 'items',
          label: 'Võimaluste plokid',
          type: 'array',
          minRows: 2,
          maxRows: 4,
          defaultValue: [
            {
              title: 'Suhtlustahvlid',
              description:
                'Loo tahvleid söömiseks, mängimiseks, õues käimiseks, tunnete väljendamiseks või teraapiaks. Iga ruut võib sisaldada pilti, teksti ja kõnet.',
              imageLabel: 'Boards Feature Image',
            },
            {
              title: 'Ühenda punktid',
              description:
                'Lisa pilt, märgi punktid ja lase lapsel neid järjest ühendada. Harjutus toetab tähelepanu, loendamist, järjestust ja käe-silma koostööd.',
              imageLabel: 'Connect-Dots Feature Image',
            },
            {
              title: 'Turvaline lapsevaade',
              description:
                'Laps näeb ainult talle mõeldud tegevusi. Haldus, muutmine ja seadistused on vanemavaate taga.',
              imageLabel: 'Child-safe home view',
            },
            {
              title: 'Jagatav sisu',
              description:
                'Vanem või spetsialist saab hoida lapsele olulised tahvlid koduvaates ning kasutada ka jagatud materjale, kui need on kättesaadavad.',
              imageLabel: 'Shared content',
            },
          ],
          fields: [
            ...textPairFields,
            mediaField('image', 'Pilt või mockup'),
            {
              name: 'imageAspectRatio',
              dbName: 'img_ratio',
              label: 'Pildi kuvasuhe',
              type: 'select',
              defaultValue: '16/9',
              options: [
                { label: '16:9 lai', value: '16/9' },
                { label: '4:3 klassikaline', value: '4/3' },
                { label: '3:2 lai foto', value: '3/2' },
                { label: '1:1 ruut', value: '1/1' },
                { label: '2:3 püstine', value: '2/3' },
              ],
            },
            {
              name: 'imageLabel',
              label: 'Pildi placeholder',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'audience',
      label: 'Kellele sobib',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Kuva sektsioon',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Loodud igapäevaseks kasutamiseks kodus, lasteaias, koolis ja teraapias',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          defaultValue:
            'Suhtleja sobib lapsele, kes vajab suhtlemisel visuaalset tuge, lihtsat valikute tegemist või korduvat harjutamist. Keskkond aitab täiskasvanul valmistada ette selgeid tegevusi ja hoida lapse ekraani rahulikuna.',
        },
        mediaField('image', 'Kasutuskonteksti pilt'),
        {
          name: 'items',
          label: 'Kasutajad',
          type: 'array',
          minRows: 1,
          maxRows: 6,
          defaultValue: [
            { text: 'lapsevanemale, kes soovib kodus lihtsaid suhtlustahvleid kasutada' },
            { text: 'õpetajale või tugispetsialistile, kes vajab korduskasutatavaid tegevusi' },
            { text: 'logopeedile või terapeudile, kes tahab luua lapsele tähenduslikke harjutusi' },
            { text: 'lapsele, kelle jaoks pilt, heli ja kordus teevad tegutsemise arusaadavamaks' },
          ],
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        {
          name: 'cta',
          label: 'Lõpunupp',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Loo lapsele esimene koduvaade' },
            { name: 'href', type: 'text', defaultValue: '/register' },
          ],
        },
      ],
    },
  ],
}
