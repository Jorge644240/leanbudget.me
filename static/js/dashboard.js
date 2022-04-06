const app = Vue.createApp({
    data() {
        return {
            profile: true,
            admins: false,
            features: false,
            questions: false,
            support: false,
            learn: false,
            users: false,
            create: false,
            remove: false,
            edit: false
        }
    },
    methods: {
        showSection(sectionID) {
            this.profile = this.admins = this.features = this.questions = this.support = this.learn = this.users = this.create = this.remove = this.edit = false;
            if (sectionID === 'profile') this.profile = true;
            else if (sectionID === 'admins') this.admins = true;
            else if (sectionID === 'features') this.features = true;
            else if (sectionID === 'questions') this.questions = true;
            else if (sectionID === 'support') this.support = true;
            else if (sectionID === 'learn') this.learn = true;
            else if (sectionID === 'users') this.users = true;
            displaySection(sectionID);
        },
        displayForm(formClass) {
            this.create = this.remove = this.edit = false;
            if (formClass === 'create') this.create = true;
            else if (formClass === 'remove') this.remove = true;
            else if (formClass === 'edit') this.edit = true;
        },
        hideForms() {
            this.create = this.remove = this.edit = false;
        }
    }
}).mount("#dashboard");

const displayProfileSection = () => {
    fetch("/admin/dashboard/profile")
    .then(res => res.json())
    .then(admin => {
        const profileSectionHTMLContent = `
            <div class="data">
                <p>${admin.admin._id}</p>
                <p>${admin.admin.user}</p>
            </div>`;
        document.querySelector("#display .profile div").innerHTML = profileSectionHTMLContent;
    });
}

const displayAdminSection = () => {
    fetch("/admin/dashboard/admins")
    .then(res => res.json())
    .then((admins) => {
        const adminSectionHTMLContent = [];
        admins.admins.forEach((admin) => {
            const adminElement = `
                <div class="data">
                    <p>${admin._id}</p>
                    <p>${admin.user}</p>
                </div>`;
            adminSectionHTMLContent.push(adminElement);
        });
        document.querySelector("#display .admins div").innerHTML = adminSectionHTMLContent.join("");
    });
}

const displayFeatureSection = () => {
    fetch("/admin/dashboard/features")
    .then(res => res.json())
    .then((features) => {
        const featureSectionHTMLContent = [];
        features.features.forEach((feature) => {
            const featureElement = `
                <div class="data">
                    <p><i class="bi-${feature.icon}"></i></p>
                    <p>${feature.title}</p>
                    ${feature.description}
                </div>`;
            featureSectionHTMLContent.push(featureElement);
        });
        document.querySelector("#display .features div").innerHTML = featureSectionHTMLContent.join("");
    });
}

const displayFAQSection = () => {
    fetch("/admin/dashboard/faq")
    .then(res => res.json())
    .then(faqs => {
        const faqSectionHTMLContent = [];
        faqs.faqs.forEach(faq => {
            const faqElement = `
                <div class="data">
                    <p>${faq.question}</p>
                    <div>${faq.answer}</div>
                </div>`;
            faqSectionHTMLContent.push(faqElement);
        });
        document.querySelector("#display .questions div").innerHTML = faqSectionHTMLContent.join("");
    });
}

const displaySupportSection = () => {
    fetch("/admin/dashboard/support")
    .then(res => res.json())
    .then(supportQuestions => {
        if (document.querySelector(".support select").value !== 'all')
            supportQuestions.questions = supportQuestions.questions.filter(question => question.status===document.querySelector(".support select").value[0].toUpperCase()+document.querySelector(".support select").value.slice(1));
        const supportSectionHTMLContent = [];
        supportQuestions.questions.forEach(question => {
            const supportElement = `
                <div class="data">
                    <p>${question.name}</p>
                    <p>${question.email}</p>
                    <p>${question.message}</p>
                </div>`;
            supportSectionHTMLContent.push(supportElement);
        });
        document.querySelector("#display .support div").innerHTML = supportSectionHTMLContent.join("");
    });
}

const displayLearningSection = () => {
    fetch("/admin/dashboard/learning")
    .then(res => res.json())
    .then(learningVideos => {
        const learningSectionHTMLContent = [];
        learningVideos.videos.forEach(video => {
            const learningElement = `
                <div class="data">
                    <p>${video.title}</p>
                    <p>${video.description}</p>
                    <p>
                        <video src=${video.video} alt=${video.title} title=${video.title} controls controlsList="nodownload">
                    </p>
                </div>`
            learningSectionHTMLContent.push(learningElement);
        });
        document.querySelector("#display .learn div").innerHTML = learningSectionHTMLContent.join("");
    });
}

const displayUserSection = () => {
    fetch("/admin/dashboard/users")
    .then(res => res.json())
    .then(users => {
        const userSectionHTMLContent = [];
        users.users.forEach(user => {
            const userElement = `
                <div class="data">
                    <p>${user.name}</p>
                    <p>${user.email}</p>
                    <p>${new Date(user.dateCreated).toLocaleDateString()}</p>
                </div>`;
                userSectionHTMLContent.push(userElement);
        });
        document.querySelector("#display .users div").innerHTML = userSectionHTMLContent.join("");
    });
}

const displaySection = (sectionID) => {
    if (sectionID === 'profile') displayProfileSection();
    else if (sectionID === "admins") displayAdminSection();
    else if (sectionID === 'features') displayFeatureSection();
    else if (sectionID === 'questions') displayFAQSection();
    else if (sectionID === 'support') displaySupportSection();
    else if (sectionID === 'learn') displayLearningSection();
    else if (sectionID === 'users') displayUserSection();
}

displaySection('profile');

setTimeout(() => {
    document.querySelector("p.message").innerHTML = '';
    document.querySelector("p.error").innerHTML = '';
}, 10000);