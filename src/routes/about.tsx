import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  Heart,
  Zap,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  Shield,
  Rocket,
  Code,
  Palette,
} from "lucide-react";
import { Link } from "@/lib/router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { seoHead } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const statIcons = [Rocket, Users, Palette, Globe];
const valueIcons = [Target, Users, Zap, Heart, Shield, Code];
const valueColors = [
  "bg-orange-50 text-orange-500",
  "bg-blue-50 text-blue-500",
  "bg-amber-50 text-amber-500",
  "bg-rose-50 text-rose-500",
  "bg-emerald-50 text-emerald-500",
  "bg-violet-50 text-violet-500",
];

const MISSION_IMAGE_URL = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=500&fit=crop';
const TEAM_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
];

type Stat = { value: string; label: string }
type ValueItem = { title: string; description: string }
type TeamMember = { name: string; role: string; bio: string }
type Milestone = { year: string; title: string; event: string }
type Award = { title: string; subtitle: string }

const AboutUs = () => {
  const { t } = useTranslation();
  const tArray = <T,>(key: string) => t(key, { returnObjects: true }) as T[]

  const stats = tArray<Stat>('about.stats').map((st, i) => ({ ...st, icon: statIcons[i % statIcons.length] }));
  const values = tArray<ValueItem>('about.values').map((v, i) => ({ ...v, icon: valueIcons[i % valueIcons.length], color: valueColors[i % valueColors.length] }));
  const team = tArray<TeamMember>('about.team').map((m, i) => ({ ...m, image: TEAM_IMAGES[i % TEAM_IMAGES.length] }));
  const milestones = tArray<Milestone>('about.milestones');
  const missionParagraphs = tArray<string>('about.missionParagraphs');
  const awards = tArray<Award>('about.awards');

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─ */}
      <section className="pt-5 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(249,115,22,0.06),transparent)]" />
        <div className="absolute top-40 -left-32 w-[500px] h-[500px] rounded-full bg-orange-50 blur-3xl" />
        <div className="absolute top-20 -right-32 w-[400px] h-[400px] rounded-full bg-orange-50 blur-3xl" />

        <div className="container mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-500 font-medium text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              {t('about.heroBadge')}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              {t('about.heroHeadline')}{" "}
              <span className="relative inline-block">
                <span className="text-orange-500">
                  {t('about.heroHighlight')}
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C40 2 80 1 100 3C120 5 160 6 199 2.5" stroke="rgba(249,115,22,0.4)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-[1.7]">
              {t('about.heroSubheadline')}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 justify-center">
              <Link to="/templates">
                <Button className="gap-2 text-base px-8 bg-orange-500 text-white hover:bg-orange-600 font-semibold">
                  {t('about.heroPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="text-base px-8 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-300">
                  {t('about.heroSecondary')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-gray-200 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-500 font-medium text-xs mb-6 uppercase tracking-wider">
                {t('about.missionBadge')}
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-[1.25]">
                {t('about.missionHeadline')}
              </motion.h2>
              <motion.div variants={fadeUp} custom={2} className="space-y-4 text-gray-500 text-lg leading-[1.7]">
                {missionParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              </motion.div>
              <motion.div variants={fadeUp} custom={3} className="mt-8 flex items-center gap-6">
                {awards.map((award, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i === 0 ? <Award className="w-8 h-8 text-orange-500" /> : <Shield className="w-8 h-8 text-orange-500" />}
                    <div>
                      <div className="font-bold text-gray-900">{award.title}</div>
                      <div className="text-sm text-gray-500">{award.subtitle}</div>
                    </div>
                    {i < awards.length - 1 && <div className="w-px h-10 bg-gray-200 ml-6" />}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img src={MISSION_IMAGE_URL} alt={t('about.missionImageAlt')} className="w-full h-[450px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-xl bg-orange-100 blur-2xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-xl bg-orange-100 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,rgba(249,115,22,0.04),transparent)]" />
        <div className="container mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-500 font-medium text-xs mb-6 uppercase tracking-wider">
              {t('about.valuesBadge')}
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('about.valuesHeadline')}</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 max-w-2xl mx-auto leading-[1.7]">{t('about.valuesSubheadline')}</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="bg-white p-8 rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl ${value.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-[1.7]">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-500 font-medium text-xs mb-6 uppercase tracking-wider">
              {t('about.milestonesBadge')}
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('about.milestonesHeadline')}</motion.h2>
          </motion.div>
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 md:-translate-x-px" />
            {milestones.map((m, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className={`relative flex items-start gap-6 mb-12 last:mb-0 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-orange-500 border-4 border-white -translate-x-1.5 mt-5 z-10" />
                <div className={`ml-14 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? "md:text-right md:pr-0" : "md:text-left md:pl-0"}`}>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-200 transition-colors">
                    <span className="text-sm font-bold text-orange-500">{m.year}</span>
                    <h3 className="font-extrabold text-lg text-gray-900 mt-1">{m.title}</h3>
                    <p className="text-gray-500 mt-1">{m.event}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50" />
        <div className="container mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-500 font-medium text-xs mb-6 uppercase tracking-wider">
              {t('about.teamBadge')}
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('about.teamHeadline')}</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 max-w-2xl mx-auto leading-[1.7]">{t('about.teamSubheadline')}</motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="group">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="font-extrabold text-xl text-white">{member.name}</h3>
                      <p className="text-sm text-white/80 font-medium">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 leading-[1.7]">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 p-10 md:p-16 text-center">
              <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                {t('about.ctaHeadline')}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-[1.7]">
                {t('about.ctaSubheadline')}
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/templates">
                  <Button size="lg" className="bg-white text-orange-500 hover:bg-white/90 gap-2 text-base px-8 font-semibold">
                    {t('about.ctaPrimary')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                    {t('about.ctaSecondary')}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/about')({
  component: AboutUs,
  head: () =>
    seoHead({
      title: 'À propos',
      description: 'Notre mission : rendre le design web professionnel accessible à tous.',
      path: '/about',
    }),
})
