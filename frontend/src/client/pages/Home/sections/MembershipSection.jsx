import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { useAuth } from '../../../../context/AuthContext';
import { Check, ArrowRight, Award } from 'lucide-react';
import { getMembershipTiers } from '../../../api/clientApi';
import { getMembershipVisual } from '../../../utils/membershipUtils';
import './MembershipSection.css';

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function MembershipSection() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    getMembershipTiers()
      .then((res) => setTiers((res.data || []).slice(0, 3)))
      .catch(() => setTiers([]));
  }, []);

  const handleJoinClick = (event) => {
    event.preventDefault();
    navigate(user ? '/membership' : '/register');
  };

  return (
    <section className="section c-membership" aria-labelledby="membership-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">Exclusive Benefits</p>
          <h2 className="display-md c-section-title" id="membership-title">{t('membership.title')}</h2>
          <p className="body-lg text-muted c-section-subtitle">{t('membership.subtitle')}</p>
        </div>

        <div className="c-membership__grid">
          {tiers.map((tier) => {
            const visual = getMembershipVisual(tier.tierName);
            const benefits = Array.isArray(tier.benefits) ? tier.benefits : splitLines(tier.benefits);
            return (
              <div key={tier.id || tier.tierName} className="c-tier-card">
                <div className="c-tier-card__header" style={{ background: visual.gradient }}>
                  <div className="c-tier-card__icon" style={{ color: visual.color }}>
                    <Award size={32} />
                  </div>
                  <h3 className="c-tier-card__name headline-md">{tier.tierName}</h3>
                  <p className="c-tier-card__points">
                    {Number(tier.minPoints || 0).toLocaleString('vi-VN')} {t('membership.points')}
                  </p>
                </div>

                <div className="c-tier-card__body">
                  <ul className="c-tier-card__benefits">
                    {benefits.slice(0, 4).map((benefit) => (
                      <li key={benefit} className="c-tier-card__benefit">
                        <Check size={15} strokeWidth={2} style={{ color: visual.color, flexShrink: 0 }} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleJoinClick}
                    className="btn btn-primary c-tier-card__cta"
                    style={{ '--btn-color': visual.color }}
                  >
                    {tier.discountPercent}% off <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-24)' }}>
          <Link to="/membership" className="btn btn-secondary btn-lg">
            Xem chi tiet 4 hang <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MembershipSection;
