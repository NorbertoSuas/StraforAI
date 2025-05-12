class CandidateMatcher {
    constructor() {
        this.weights = {
            skills: 0.35,
            experience: 0.25,
            education: 0.20,
            feedback: 0.20
        };
    }

    match_candidate(candidateData, vacancyData) {
        try {
            console.log('Starting candidate matching process');
            
            // Calculate individual scores
            const skillsScore = this._calculateSkillsMatch(
                this._parseSkills(candidateData.skills),
                this._parseSkills(vacancyData.skills)
            );

            const experienceScore = this._calculateExperienceMatch(
                parseInt(candidateData.experience),
                vacancyData.experience
            );

            const educationScore = this._calculateEducationMatch(
                candidateData.education,
                vacancyData.education
            );

            // Use description/feedback for semantic matching
            const feedbackScore = this._calculateDescriptionMatch(
                candidateData.description || '',
                vacancyData.description || ''
            );

            console.log('Individual scores calculated:', {
                skillsScore,
                experienceScore,
                educationScore,
                feedbackScore
            });

            // Calculate weighted score
            const matchScore = (
                this.weights.skills * skillsScore +
                this.weights.experience * experienceScore +
                this.weights.education * educationScore +
                this.weights.feedback * feedbackScore
            );

            const result = {
                match_score: Math.min(Math.max(matchScore, 0), 1), // Ensure score is between 0 and 1
                candidate_id: candidateData.id,
                vacancy_id: vacancyData.id,
                match_details: this._generateMatchDetails(matchScore, {
                    skills: skillsScore,
                    experience: experienceScore,
                    education: educationScore,
                    feedback: feedbackScore
                })
            };

            console.log('Match result:', result);
            return result;

        } catch (error) {
            console.error('Error in match_candidate:', error);
            throw new Error(`Matching process failed: ${error.message}`);
        }
    }

    _parseSkills(skillsString) {
        if (!skillsString) return [];
        return skillsString.toLowerCase().split(',').map(s => s.trim());
    }

    _calculateSkillsMatch(candidateSkills, vacancySkills) {
        if (!candidateSkills.length || !vacancySkills.length) return 0;

        const matchingSkills = candidateSkills.filter(skill =>
            vacancySkills.some(vs => vs.includes(skill) || skill.includes(vs))
        ).length;

        return matchingSkills / Math.max(vacancySkills.length, 1);
    }

    _calculateExperienceMatch(candidateExp, requiredExp) {
        if (isNaN(candidateExp)) return 0;

        // Convert experience level to years
        const expLevels = {
            'Entry Level': 0,
            'Mid Level': 3,
            'Senior Level': 5,
            'Executive': 8
        };

        const requiredYears = expLevels[requiredExp] || 0;
        
        if (candidateExp >= requiredYears) {
            return 1;
        } else {
            return Math.max(0, candidateExp / requiredYears);
        }
    }

    _calculateEducationMatch(candidateEdu, requiredEdu) {
        if (!candidateEdu || !requiredEdu) return 0;

        const eduLevels = {
            'High School': 1,
            'Bachelor': 2,
            'Master': 3,
            'PhD': 4
        };

        // Simple text matching for now
        if (candidateEdu.toLowerCase().includes(requiredEdu.toLowerCase())) {
            return 1;
        }
        return 0.5; // Partial match
    }

    _calculateDescriptionMatch(candidateDesc, vacancyDesc) {
        if (!candidateDesc || !vacancyDesc) return 0;

        // Convert to lowercase and split into words
        const vacancyKeywords = this._extractKeywords(vacancyDesc);
        const candidateKeywords = this._extractKeywords(candidateDesc);

        const matchingKeywords = candidateKeywords.filter(word =>
            vacancyKeywords.includes(word)
        ).length;

        return matchingKeywords / Math.max(vacancyKeywords.length, 1);
    }

    _extractKeywords(text) {
        // Remove common words and split into keywords
        const commonWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        return text.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 2 && !commonWords.has(word));
    }

    _generateMatchDetails(score, scores) {
        return {
            confidence: score,
            match_level: this._getMatchLevel(score),
            recommendation: this._getRecommendation(score),
            score_breakdown: scores
        };
    }

    _getMatchLevel(score) {
        if (score >= 0.8) return 'Excellent Match';
        if (score >= 0.6) return 'Good Match';
        if (score >= 0.4) return 'Moderate Match';
        return 'Low Match';
    }

    _getRecommendation(score) {
        if (score >= 0.8) return 'Strongly recommended for this position';
        if (score >= 0.6) return 'Shows good potential for this role';
        if (score >= 0.4) return 'May need additional screening';
        return 'May not be the best fit for this position';
    }
}

module.exports = CandidateMatcher; 