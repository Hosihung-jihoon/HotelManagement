import { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle, Crown, Gift, Shield, Star } from 'lucide-react';
import { getMembershipTiers } from '../../api/clientApi';
import { POINT_TO_VND_RATE, getMembershipVisual } from '../../utils/membershipUtils';
import './MembershipPage.css';

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function MembershipPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Membership - Hotel Management';
    getMembershipTiers()
      .then((res) => setTiers(res.data || []))
      .catch(() => setTiers([]))
      .finally(() => setLoading(false));
  }, []);

  const tierCards = useMemo(
    () => tiers.map((tier) => ({
      ...tier,
      benefitsList: Array.isArray(tier.benefits) ? tier.benefits : splitLines(tier.benefits),
      redeemList: Array.isArray(tier.redeemOptions) ? tier.redeemOptions : splitLines(tier.redeemOptions),
      visual: getMembershipVisual(tier.tierName)
    })),
    [tiers]
  );

  if (loading) {
    return (
      <div className="membership-loading">
        <div className="spinner" />
        <p>Dang tai thong tin hang thanh vien...</p>
      </div>
    );
  }

  return (
    <div className="membership-page">
      <div className="membership-hero">
        <div className="membership-hero-content">
          <h1>Chuong trinh thanh vien 4 hang</h1>
          <p>Tich diem tu moi hoa don hop le, nang hang tu dong va doi diem thanh uu dai gia tri cho ky nghi tiep theo.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <span className="badge badge-available">1 diem = {POINT_TO_VND_RATE.toLocaleString('vi-VN')}d</span>
            <span className="badge badge-silver">Chi tinh diem tren hoa don Paid</span>
          </div>
        </div>
      </div>

      <div className="membership-benefits-section">
        <h2>Cach tich va doi diem</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <Star className="benefit-icon" />
            <h3>Tich diem ro rang</h3>
            <p>Moi {POINT_TO_VND_RATE.toLocaleString('vi-VN')}d chi tieu hop le nhan 1 diem co ban, sau do nhan them theo he so cua hang thanh vien.</p>
          </div>
          <div className="benefit-card">
            <Shield className="benefit-icon" />
            <h3>Len hang tu dong</h3>
            <p>Hang se tu dong cap nhat khi tong diem tich luy dat moc cua Dong, Bac, Vang va Kim cuong.</p>
          </div>
          <div className="benefit-card">
            <Gift className="benefit-icon" />
            <h3>Doi diem linh hoat</h3>
            <p>Doi voucher, bua sang, airport transfer hoac room upgrade tuy theo so diem hien co.</p>
          </div>
        </div>
      </div>

      <div className="membership-tiers-section">
        <h2>Cac hang thanh vien</h2>
        <div className="tiers-container">
          {tierCards.map((tier) => (
            <div className="tier-card" key={tier.id || tier.tierName}>
              <div className="tier-header" style={{ borderColor: tier.visual.color }}>
                <Award className="tier-icon" style={{ color: tier.visual.color }} size={48} />
                <h3 style={{ color: tier.visual.color }}>{tier.tierName}</h3>
                <div className="tier-points">{Number(tier.minPoints || 0).toLocaleString('vi-VN')} diem</div>
                <div style={{ marginTop: 8, color: '#64748b', fontSize: '0.9rem' }}>
                  He so tich diem x{Number(tier.pointMultiplier || 1).toFixed(2)}
                </div>
              </div>
              <div className="tier-discount">
                <span className="discount-value">{Number(tier.discountPercent || 0)}%</span>
                <span className="discount-label">uu dai dat phong</span>
              </div>
              <ul className="tier-features">
                {tier.benefitsList.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle size={16} className="check-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {tier.redeemList.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <h4 style={{ marginBottom: 10 }}>Quy doi diem</h4>
                  <ul className="tier-features">
                    {tier.redeemList.map((item) => (
                      <li key={item}>
                        <Crown size={16} className="check-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
