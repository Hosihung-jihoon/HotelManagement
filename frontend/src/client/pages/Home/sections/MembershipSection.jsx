import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { useAuth } from '../../../../context/AuthContext';
import { Check, ArrowRight, Crown, Award, Gem } from 'lucide-react';
import './MembershipSection.css';

const TIERS = [
  {
    key: 'bronze',
    icon: <Award size={32} />,
    minPoints: 0,
    maxPoints: 4999,
    color: '#a0674a',
    gradient: 'linear-gradient(135deg, #f0d0b8 0%, #a0674a 100%)',
    benefits: [
      'Tích 1 điểm / 10.000₫',
      'Ưu tiên check-in sớm',
      'Giảm 5% dịch vụ Spa',
      'Chào mừng trái cây & nước',
    ],
    benefitsEn: [
      '1 point per 10,000₫ spent',
      'Early check-in priority',
      '5% off Spa services',
      'Welcome fruit & water',
    ],
  },
  {
    key: 'silver',
    icon: <Gem size={32} />,
    minPoints: 5000,
    maxPoints: 14999,
    color: '#535f70',
    gradient: 'linear-gradient(135deg, #e8edf2 0%, #8a9db5 100%)',
    popular: true,
    benefits: [
      'Tích 1.5 điểm / 10.000₫',
      'Check-in sớm & late check-out',
      'Giảm 10% dịch vụ Spa & F&B',
      'Nâng hạng phòng khi có sẵn',
      'WiFi tốc độ cao miễn phí',
    ],
    benefitsEn: [
      '1.5 points per 10,000₫',
      'Early check-in & late check-out',
      '10% off Spa & F&B',
      'Room upgrade when available',
      'Complimentary high-speed WiFi',
    ],
  },
  {
    key: 'gold',
    icon: <Crown size={32} />,
    minPoints: 15000,
    maxPoints: null,
    color: '#c9a84c',
    gradient: 'linear-gradient(135deg, #f6e27a 0%, #c9a84c 100%)',
    benefits: [
      'Tích 2 điểm / 10.000₫',
      'Check-in / out linh hoạt',
      'Giảm 20% tất cả dịch vụ',
      'Nâng hạng phòng bảo đảm',
      'Quà chào mừng cao cấp',
      'Concierge riêng 24/7',
    ],
    benefitsEn: [
      '2 points per 10,000₫',
      'Flexible check-in/out',
      '20% off all services',
      'Guaranteed room upgrade',
      'Premium welcome gift',
      'Dedicated 24/7 concierge',
    ],
  },
];

function MembershipSection() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoinClick = (e, tierKey) => {
    e.preventDefault();
    if (user) {
      navigate('/membership');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="section c-membership" aria-labelledby="membership-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">Exclusive Benefits</p>
          <h2 className="display-md c-section-title" id="membership-title">
            {t('membership.title')}
          </h2>
          <p className="body-lg text-muted c-section-subtitle">{t('membership.subtitle')}</p>
        </div>

        <div className="c-membership__grid">
          {TIERS.map(tier => (
            <div
              key={tier.key}
              className={`c-tier-card ${tier.popular ? 'c-tier-card--popular' : ''}`}
              id={`membership-${tier.key}`}
            >
              {tier.popular && (
                <div className="c-tier-card__popular-badge">Most Popular</div>
              )}

              <div className="c-tier-card__header" style={{ background: tier.gradient }}>
                <div className="c-tier-card__icon" style={{ color: tier.color }}>
                  {tier.icon}
                </div>
                <h3 className="c-tier-card__name headline-md">
                  {t(`membership.${tier.key}`)}
                </h3>
                <p className="c-tier-card__points">
                  {tier.minPoints.toLocaleString()}
                  {tier.maxPoints ? ` – ${tier.maxPoints.toLocaleString()}` : '+'} {t('membership.points')}
                </p>
              </div>

              <div className="c-tier-card__body">
                <ul className="c-tier-card__benefits">
                  {(lang === 'vi' ? tier.benefits : tier.benefitsEn).map((b, i) => (
                    <li key={i} className="c-tier-card__benefit">
                      <Check size={15} strokeWidth={2} style={{ color: tier.color, flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => handleJoinClick(e, tier.key)}
                  className="btn btn-primary c-tier-card__cta"
                  style={{ '--btn-color': tier.color }}
                  id={`join-${tier.key}-btn`}
                >
                  {t('membership.joinNow')} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MembershipSection;
