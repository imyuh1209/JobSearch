import { Divider } from "antd";
import CompanyCard from "../../components/client/card/company.card";
import JobCard from "../../components/client/card/job.card";
import styles from '../../styles/client.module.scss'
import RecruitmentBanner from "../../components/client/banner/recruitment.banner";

const HomePage = () => {
    return (
        <>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <RecruitmentBanner />
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