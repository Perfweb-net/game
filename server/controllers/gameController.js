const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upgrade = async (req, res) => {
    try {
        const { type } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        
        let cost = 0;
        let updateData = {};

        if (type === 'damage') {
            cost = user.damageLevel * 50;
            if (user.credits < cost) return res.status(400).json({ error: 'Pas assez de crédits' });
            updateData = { damageLevel: user.damageLevel + 1 };
        } else if (type === 'fusion') {
            cost = user.fusionLimitLevel * 100;
            if (user.credits < cost) return res.status(400).json({ error: 'Pas assez de crédits' });
            updateData = { fusionLimitLevel: user.fusionLimitLevel + 1 };
        } else {
            return res.status(400).json({ error: 'Type d\'amélioration invalide' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: { ...updateData, credits: user.credits - cost }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Échec de l\'amélioration' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { maxWave: 'desc' },
            take: 10,
            select: { username: true, maxWave: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Échec de la récupération du classement' });
    }
};

module.exports = { upgrade, getLeaderboard };
