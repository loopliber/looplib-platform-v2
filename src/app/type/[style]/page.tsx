// app/type/[style]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Music, Download, TrendingUp, Zap, Clock, Hash } from 'lucide-react';
import SampleBrowser from '@/components/SampleBrowser';

// Artist configurations
const artistConfigs: Record<string, any> = {
  'travis-scott': {
    name: 'Travis Scott',
    genre: 'trap',
    description: 'Dark, atmospheric trap beats with psychedelic elements and auto-tuned vocals',
    keywords: 'travis scott type beat, travis scott samples, dark trap, psychedelic trap, houston trap',
    accentColor: 'red',
    bpmRange: '130-160 BPM',
    popularKeys: ['F Minor', 'G Minor', 'A♭ Major'],
    similarArtists: ['Don Toliver', 'Sheck Wes', 'Gunna', 'Young Thug'],
    popularSongs: ['SICKO MODE', 'Goosebumps', 'HIGHEST IN THE ROOM', 'Antidote'],
    productionStyle: [
      'Heavy use of auto-tune and vocal effects',
      'Dark, atmospheric melodies with reversed elements',
      'Psychedelic sound design and ambient textures',
      'Distorted 808s with unique bounce patterns'
    ]
  },
  'drake': {
    name: 'Drake',
    genre: 'rnb',
    description: 'Melodic R&B and trap fusion with emotional melodies and ambient textures',
    keywords: 'drake type beat, drake samples, toronto sound, ovo sound, melodic trap',
    accentColor: 'purple',
    bpmRange: '70-140 BPM',
    popularKeys: ['B♭ Minor', 'E♭ Major', 'F Minor'],
    similarArtists: ['PartyNextDoor', 'The Weeknd', 'Bryson Tiller', '6lack'],
    popularSongs: ['God\'s Plan', 'One Dance', 'Hotline Bling', 'In My Feelings'],
    productionStyle: [
      'Emotional piano and guitar melodies',
      'Ambient, spacious production with reverb',
      'Mix of trap hi-hats and R&B grooves',
      'Smooth bass lines with melodic elements'
    ]
  },
  'metro-boomin': {
    name: 'Metro Boomin',
    genre: 'trap',
    description: 'Dark orchestral trap with haunting melodies and cinematic soundscapes',
    keywords: 'metro boomin type beat, metro boomin samples, orchestral trap, dark trap',
    accentColor: 'red',
    bpmRange: '120-150 BPM',
    popularKeys: ['C Minor', 'D Minor', 'E♭ Minor'],
    similarArtists: ['Southside', 'TM88', 'Murda Beatz', 'Wheezy'],
    popularSongs: ['Space Cadet', 'No Complaints', 'Ric Flair Drip', 'Without Warning'],
    productionStyle: [
      'Orchestral strings and brass elements',
      'Horror movie-inspired sound design',
      'Booming 808s with precise patterns',
      'Dark, ominous chord progressions'
    ]
  },
  'the-weeknd': {
    name: 'The Weeknd',
    genre: 'rnb',
    description: 'Dark R&B with 80s synthwave influences and moody atmospheric production',
    keywords: 'the weeknd type beat, the weeknd samples, dark rnb, synthwave rnb',
    accentColor: 'purple',
    bpmRange: '80-120 BPM',
    popularKeys: ['A Minor', 'F Minor', 'C Minor'],
    similarArtists: ['Frank Ocean', 'Miguel', 'Bryson Tiller', 'DVSN'],
    popularSongs: ['Blinding Lights', 'Starboy', 'The Hills', 'Can\'t Feel My Face'],
    productionStyle: [
      '80s-inspired analog synths',
      'Dark, moody atmosphere with reverb',
      'Retro drum machines and percussion',
      'Lush pad layers and atmospheric effects'
    ]
  },
  'future': {
    name: 'Future',
    genre: 'trap',
    description: 'Heavy auto-tuned trap with aggressive 808s and dark melodies',
    keywords: 'future type beat, future samples, atlanta trap, auto-tune trap',
    accentColor: 'orange',
    bpmRange: '130-170 BPM',
    popularKeys: ['F Minor', 'G Minor', 'C Minor'],
    similarArtists: ['Young Thug', 'Lil Uzi Vert', '21 Savage', 'Gunna'],
    popularSongs: ['Mask Off', 'Life Is Good', 'Low Life', 'Jumpman'],
    productionStyle: [
      'Heavy auto-tune on melodies',
      'Dark, minor key progressions',
      'Aggressive 808 patterns',
      'Atmospheric synth layers'
    ]
  },
  'gunna': {
    name: 'Gunna',
    genre: 'trap',
    description: 'Melodic trap with smooth flows and luxurious atmospheric production',
    keywords: 'gunna type beat, gunna samples, atlanta trap, melodic trap',
    accentColor: 'blue',
    bpmRange: '120-150 BPM',
    popularKeys: ['D Minor', 'F Minor', 'A Minor'],
    similarArtists: ['Lil Baby', 'Young Thug', 'Lil Keed', 'NAV'],
    popularSongs: ['Drip Too Hard', 'Pushin P', 'Banking On Me', 'Top Off'],
    productionStyle: [
      'Smooth, melodic progressions',
      'Luxurious sound selection',
      'Crisp hi-hat patterns',
      'Spacious mix with ambient elements'
    ]
  },
  'partynextdoor': {
    name: 'PartyNextDoor',
    genre: 'rnb',
    description: 'Dark, moody R&B with atmospheric production and melodic vocals',
    keywords: 'partynextdoor type beat, pnd samples, toronto rnb, ovo sound',
    accentColor: 'purple',
    bpmRange: '80-130 BPM',
    popularKeys: ['F Minor', 'A♭ Major', 'E♭ Minor'],
    similarArtists: ['Drake', 'The Weeknd', 'Bryson Tiller', 'Roy Woods'],
    popularSongs: ['Come and See Me', 'Recognize', 'Not Nice', 'Believe It'],
    productionStyle: [
      'Dark, moody chord progressions',
      'Atmospheric synth layers',
      'Trap-influenced drums with R&B groove',
      'Melodic bass lines'
    ]
  },
  'bryson-tiller': {
    name: 'Bryson Tiller',
    genre: 'rnb',
    description: 'Trap-soul fusion with emotional melodies and smooth vocals',
    keywords: 'bryson tiller type beat, bryson tiller samples, trapsoul, kentucky rnb',
    accentColor: 'purple',
    bpmRange: '70-120 BPM',
    popularKeys: ['G Minor', 'B♭ Minor', 'D Minor'],
    similarArtists: ['Drake', 'PartyNextDoor', '6lack', 'Tory Lanez'],
    popularSongs: ['Don\'t', 'Exchange', 'Sorry Not Sorry', 'Run Me Dry'],
    productionStyle: [
      'Trap drums with R&B melodies',
      'Emotional piano progressions',
      'Heavy use of reverb and delay',
      'Smooth bass lines with 808s'
    ]
  },
  '6lack': {
    name: '6lack',
    genre: 'rnb',
    description: 'Dark alternative R&B with introspective lyrics and minimalist production',
    keywords: '6lack type beat, 6lack samples, dark rnb, atlanta rnb',
    accentColor: 'purple',
    bpmRange: '70-110 BPM',
    popularKeys: ['A Minor', 'C Minor', 'F Minor'],
    similarArtists: ['Bryson Tiller', 'PartyNextDoor', 'Drake', 'Roy Woods'],
    popularSongs: ['PRBLMS', 'Ex Calling', 'OTW', 'Balenciaga Challenge'],
    productionStyle: [
      'Minimalist, dark production',
      'Sparse drum patterns',
      'Atmospheric pads and textures',
      'Deep sub bass'
    ]
  },
  'young-thug': {
    name: 'Young Thug',
    genre: 'trap',
    description: 'Experimental trap with unique vocal styles and eclectic production',
    keywords: 'young thug type beat, thugger samples, atlanta trap, slime season',
    accentColor: 'green',
    bpmRange: '120-160 BPM',
    popularKeys: ['F Minor', 'G Minor', 'E♭ Minor'],
    similarArtists: ['Gunna', 'Lil Baby', 'Future', 'Lil Keed'],
    popularSongs: ['Best Friend', 'Hot', 'The London', 'Go Crazy'],
    productionStyle: [
      'Experimental melody choices',
      'Unique sound selection',
      'Complex hi-hat patterns',
      'Heavy 808 presence'
    ]
  },
  'lil-baby': {
    name: 'Lil Baby',
    genre: 'trap',
    description: 'Hard-hitting trap with piano melodies and street-inspired themes',
    keywords: 'lil baby type beat, lil baby samples, atlanta trap, piano trap',
    accentColor: 'green',
    bpmRange: '120-150 BPM',
    popularKeys: ['C Minor', 'F Minor', 'G Minor'],
    similarArtists: ['Gunna', 'Young Thug', 'Lil Durk', '42 Dugg'],
    popularSongs: ['Drip Too Hard', 'Yes Indeed', 'The Bigger Picture', 'Woah'],
    productionStyle: [
      'Melodic piano loops',
      'Hard-hitting 808s',
      'Simple but effective melodies',
      'Street-oriented sound selection'
    ]
  },
  '21-savage': {
    name: '21 Savage',
    genre: 'trap',
    description: 'Dark, minimalist trap with menacing production and hard-hitting 808s',
    keywords: '21 savage type beat, 21 savage samples, atlanta trap, dark trap',
    accentColor: 'red',
    bpmRange: '120-140 BPM',
    popularKeys: ['C Minor', 'D Minor', 'F Minor'],
    similarArtists: ['Metro Boomin', 'Future', 'Offset', 'Lil Baby'],
    popularSongs: ['Bank Account', 'A Lot', 'Runnin', 'Mr. Right Now'],
    productionStyle: [
      'Dark, minimalist melodies',
      'Heavy, distorted 808s',
      'Simple hi-hat patterns',
      'Ominous atmosphere'
    ]
  },
  'lil-uzi-vert': {
    name: 'Lil Uzi Vert',
    genre: 'trap',
    description: 'Melodic trap with futuristic production and energetic vibes',
    keywords: 'lil uzi vert type beat, uzi samples, melodic trap, rage beats',
    accentColor: 'pink',
    bpmRange: '130-170 BPM',
    popularKeys: ['F♯ Minor', 'G Minor', 'A Minor'],
    similarArtists: ['Playboi Carti', 'Juice WRLD', 'Trippie Redd', 'Future'],
    popularSongs: ['XO Tour Llif3', 'Just Wanna Rock', 'Money Longer', 'Sauce It Up'],
    productionStyle: [
      'Futuristic synth sounds',
      'Melodic, uplifting progressions',
      'Fast-paced hi-hats',
      'Energetic 808 patterns'
    ]
  }
};

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { style: string } }): Promise<Metadata> {
  const artist = artistConfigs[params.style];
  
  if (!artist) {
    return {
      title: 'Artist Not Found | LoopLib',
      description: 'The requested artist page could not be found.',
    };
  }

  return {
    title: `Free ${artist.name} Type Samples & Loops | ${artist.name} Type Beats | LoopLib`,
    description: `Download free ${artist.name} type samples and loops. ${artist.description}. 100% royalty-free for personal use.`,
    keywords: artist.keywords,
    openGraph: {
      title: `Free ${artist.name} Type Samples & Loops`,
      description: artist.description,
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Free ${artist.name} Type Samples & Loops`,
      description: artist.description,
    }
  };
}

export default function ArtistStylePage({ params }: { params: { style: string } }) {
  const artist = artistConfigs[params.style];
  
  if (!artist) {
    notFound();
  }

  return (
    <>
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${artist.name} Type Beats`,
            description: artist.description,
            url: `https://looplib.com/type/${params.style}`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://looplib.com'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: `${artist.name} Type Beats`,
                  item: `https://looplib.com/type/${params.style}`
                }
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Main Hero Section - No duplicate header */}
        <header className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-4xl mx-auto">
              {/* Main H1 - Most important for SEO */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                Free {artist.name} Type Samples & Loops
              </h1>
              
              {/* Subtitle with keywords */}
              <p className="text-xl sm:text-2xl text-neutral-300 mb-8">
                {artist.description}
              </p>
              
              {/* Trust indicators */}
              <div className="flex justify-center items-center space-x-8 text-sm sm:text-base">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-400">100+</p>
                  <p className="text-neutral-400">Free Samples</p>
                </div>
                <div className="w-px h-14 bg-neutral-700" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-400">100%</p>
                  <p className="text-neutral-400">Royalty Free</p>
                </div>
                <div className="w-px h-14 bg-neutral-700" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-400">{artist.bpmRange}</p>
                  <p className="text-neutral-400">Tempo Range</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Info Section */}
        <section className="py-8 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-400" />
                <div>
                  <h3 className="font-semibold">BPM Range</h3>
                  <p className="text-sm text-neutral-400">{artist.bpmRange}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Music className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="font-semibold">Popular Keys</h3>
                  <p className="text-sm text-neutral-400">{artist.popularKeys.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Hash className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="font-semibold">Genre</h3>
                  <p className="text-sm text-neutral-400 capitalize">{artist.genre}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="font-semibold">Downloads</h3>
                  <p className="text-sm text-neutral-400">No signup required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Browser Component */}
        <SampleBrowser 
          initialGenre={artist.genre as any}
          pageTitle=""
          pageSubtitle=""
          accentColor={artist.accentColor}
        />

        {/* SEO Content Sections */}
        <article className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {/* How to Make Section */}
          <section>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              How to Make {artist.name} Type Beats: Complete Producer Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Production Style Elements
                </h3>
                <ul className="space-y-3 text-neutral-300">
                  {artist.productionStyle.map((element: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      {element}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Reference Tracks
                </h3>
                <p className="text-neutral-400 mb-4">Study these {artist.name} hits:</p>
                <ul className="space-y-2 text-neutral-300">
                  {artist.popularSongs.map((song: string) => (
                    <li key={song} className="flex items-center">
                      <Music className="w-4 h-4 mr-2 text-neutral-500" />
                      {song}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Sound Selection Guide */}
          <section>
            <h2 className="text-3xl font-bold mb-6">
              {artist.name} Sound Selection Guide
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-neutral-300 mb-6">
                Creating authentic {artist.name} type beats starts with choosing the right sounds. 
                Focus on {artist.genre} samples that capture the essence of {artist.description.toLowerCase()}.
              </p>
              
              <h3 className="text-xl font-bold mt-8 mb-4">Key Elements to Look For:</h3>
              <ul className="space-y-2 text-neutral-300">
                <li>• <strong>Tempo:</strong> Most {artist.name} tracks fall within {artist.bpmRange}</li>
                <li>• <strong>Key Signatures:</strong> {artist.popularKeys.join(', ')} are commonly used</li>
                <li>• <strong>Sound Texture:</strong> Focus on {artist.productionStyle[0].toLowerCase()}</li>
                <li>• <strong>Arrangement:</strong> Study the structure of hits like "{artist.popularSongs[0]}"</li>
              </ul>
            </div>
          </section>

          {/* Similar Artists Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Producers Similar to {artist.name}
            </h2>
            <p className="text-neutral-400 mb-8">
              If you like {artist.name}'s style, explore these similar artists:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artist.similarArtists.map((similarArtist: string) => {
                // Only show links to artists that exist
                const slug = similarArtist.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
                const exists = !!artistConfigs[slug];
                
                if (exists) {
                  return (
                    <a
                      key={similarArtist}
                      href={`/type/${slug}`}
                      className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-center transition-all hover:scale-105 hover:border-orange-500/50"
                    >
                      <h4 className="font-medium">{similarArtist}</h4>
                      <p className="text-xs text-neutral-400 mt-1">Free Samples →</p>
                    </a>
                  );
                } else {
                  return (
                    <div
                      key={similarArtist}
                      className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4 text-center opacity-50"
                    >
                      <h4 className="font-medium">{similarArtist}</h4>
                      <p className="text-xs text-neutral-500 mt-1">Coming Soon</p>
                    </div>
                  );
                }
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8">
              Frequently Asked Questions About {artist.name} Type Beats
            </h2>
            <div className="space-y-6">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">
                  What BPM does {artist.name} use?
                </h3>
                <p className="text-neutral-300">
                  {artist.name} typically produces at {artist.bpmRange}. This tempo range creates 
                  the perfect energy for {artist.genre} production while maintaining the signature bounce.
                </p>
              </div>
              
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">
                  What key signatures work best for {artist.name} type beats?
                </h3>
                <p className="text-neutral-300">
                  The most common keys in {artist.name} production are {artist.popularKeys.join(', ')}. 
                  These keys provide the {artist.genre === 'trap' ? 'dark, moody' : 'smooth, emotional'} feel 
                  that characterizes their sound.
                </p>
              </div>
              
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">
                  Can I use these {artist.name} type samples commercially?
                </h3>
                <p className="text-neutral-300">
                  Yes! All our samples are 100% royalty-free for personal use. When you're ready to 
                  release your music commercially, we offer affordable licensing options that give you 
                  full rights to use the samples in your releases.
                </p>
              </div>
            </div>
          </section>
        </article>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-b from-neutral-900 to-black py-16 border-t border-neutral-800">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">
              Start Making {artist.name} Type Beats Today
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              Download free samples instantly. No signup required.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="#samples"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors"
              >
                Browse Samples
              </a>
              <a 
                href="/samples"
                className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
              >
                Explore All Genres
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}