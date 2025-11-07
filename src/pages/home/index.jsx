import { Divider } from "antd";
import CompanyCard from "../../components/client/card/company.card";
import JobCard from "../../components/client/card/job.card";
import styles from '../../styles/client.module.scss'
import HomeBannerCarousel from "../../components/client/banner/home.banner";

const HomePage = () => {
    return (
        <>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <HomeBannerCarousel />
                <Divider />
                <CompanyCard />
                <div style={{ margin: 50 }}></div>
                <Divider />
                <JobCard />
            </div>
            

        </>
    )
    
}

export default HomePage;